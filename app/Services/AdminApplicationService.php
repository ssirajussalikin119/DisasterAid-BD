<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Database\DatabaseManager;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class AdminApplicationService
{
    private const SQL_PATH = 'sql/admin/application_review/';

    private const BASE_SQL_PATH = 'sql/admin/';

    public function __construct(private readonly DatabaseManager $database)
    {
    }

    public function queue(?string $search, ?string $type, ?string $status): array
    {
        $pattern = $search === null || $search === '' ? null : '%'.$search.'%';
        $bindings = [
            $pattern, $pattern, $pattern, $pattern, $status, $status,
            $pattern, $pattern, $pattern, $pattern, $status, $status,
            $type, $type,
        ];

        $rows = array_map(function (object $row): object {
            $row->application_payload = json_decode((string) $row->application_payload, true) ?: [];
            return $row;
        }, $this->select(self::BASE_SQL_PATH.'application_queue.sql', $bindings));
        $linked = $this->select(self::BASE_SQL_PATH.'approved_volunteers_intersect.sql');

        return [
            'applications' => $rows,
            'pending_count' => count(array_filter($rows, fn (object $row): bool => $row->application_status === 'pending')),
            'consistency' => [
                'linked_approved_volunteers' => array_map(fn (object $row): int => (int) $row->user_id, $linked),
            ],
        ];
    }

    public function review(int $id, int $adminId, string $decision, ?string $notes): object
    {
        $connection = $this->database->connection();

        $this->clearAbortedTransaction($connection);

        $connection->beginTransaction();

        try {
            $state = $this->selectOnConnection($connection, self::BASE_SQL_PATH.'application_state.sql', [$id])[0] ?? null;

            if ($state === null) {
                throw (new ModelNotFoundException())->setModel('role_applications', [$id]);
            }

            if ($state->status !== 'pending') {
                throw ValidationException::withMessages([
                    'application' => ['Only pending applications can be reviewed.'],
                ]);
            }

            $file = $decision === 'approved' ? 'application_approve.sql' : 'application_reject.sql';
            $reviewed = $this->selectOnConnection($connection, self::BASE_SQL_PATH.$file, [$adminId, $notes, $id])[0] ?? null;

            if ($reviewed === null) {
                throw ValidationException::withMessages([
                    'application' => ['The application could not be reviewed.'],
                ]);
            }

            if ($decision === 'approved') {
                $connection->statement(
                    file_get_contents(database_path(self::BASE_SQL_PATH.'update_user_role.sql')),
                    [$state->requested_role, $state->user_id]
                );

                if ($state->requested_role === 'volunteer') {
                    $payload = json_decode((string) $state->application_payload, true) ?: [];
                    $skills = json_encode($payload['skills'] ?? []);
                    $availability = (string) ($payload['availability'] ?? 'available');
                    $connection->statement(
                        file_get_contents(database_path(self::BASE_SQL_PATH.'upsert_volunteer_profile.sql')),
                        [$state->user_id, $skills, $availability]
                    );
                }
            }

            $connection->commit();

            return $reviewed;
        } catch (\Throwable $e) {
            $connection->rollBack();
            throw $e;
        }
    }

    private function clearAbortedTransaction(\Illuminate\Database\Connection $connection): void
    {
        try {
            $pdo = $connection->getPdo();
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
        } catch (\Throwable) {
        }
    }

    private function selectOnConnection(\Illuminate\Database\Connection $connection, string $file, array $bindings = []): array
    {
        return $connection->select(file_get_contents(database_path($file)), $bindings);
    }

    public function innerJoinApplicationApplicant(?string $search, ?string $type, ?string $status): array
    {
        $pattern = $search === null || $search === '' ? null : '%'.$search.'%';
        $bindings = [$pattern, $pattern, $pattern, $pattern, $type, $type, $status, $status];

        return $this->decodePayloads($this->select(self::SQL_PATH.'inner_join_application_applicant.sql', $bindings));
    }

    public function leftJoinApplicationReviewer(?string $search, ?string $type, ?string $status): array
    {
        $pattern = $search === null || $search === '' ? null : '%'.$search.'%';
        $bindings = [$pattern, $pattern, $pattern, $pattern, $type, $type, $status, $status];

        return $this->decodePayloads($this->select(self::SQL_PATH.'left_join_application_reviewer.sql', $bindings));
    }

    public function unionApplicationQueue(?string $search, ?string $type, ?string $status): array
    {
        $pattern = $search === null || $search === '' ? null : '%'.$search.'%';
        $bindings = [
            $pattern, $pattern, $pattern, $pattern, $status, $status,
            $pattern, $pattern, $pattern, $pattern, $status, $status,
        ];

        return $this->decodePayloads($this->select(self::SQL_PATH.'union_application_queue.sql', $bindings));
    }

    public function intersectApprovedVolunteers(): array
    {
        return $this->select(self::SQL_PATH.'intersect_approved_volunteers.sql');
    }

    public function applicationStatistics(): array
    {
        return $this->select(self::SQL_PATH.'application_statistics.sql');
    }

    public function overviewStats(): array
    {
        $result = $this->select(self::SQL_PATH.'application_overview_stats.sql');
        $row = $result[0] ?? null;

        if ($row === null) {
            return [
                'total_applications' => 0,
                'pending_applications' => 0,
                'approved_applications' => 0,
                'rejected_applications' => 0,
                'volunteer_applications' => 0,
                'ngo_applications' => 0,
                'volunteer_pending' => 0,
                'ngo_pending' => 0,
            ];
        }

        return (array) $row;
    }

    public function recentFilteredApplications(?string $status, ?string $type, int $limit = 20, int $offset = 0): array
    {
        $bindings = [$status, $status, $type, $type, $limit, $offset];

        return $this->decodePayloads($this->select(self::SQL_PATH.'recent_filtered_applications.sql', $bindings));
    }

    public function applicationDetail(int $id): ?object
    {
        $result = $this->select(self::SQL_PATH.'application_detail.sql', [$id]);

        $application = $result[0] ?? null;

        if ($application !== null) {
            $application->application_payload = json_decode((string) $application->application_payload, true) ?: [];
        }

        return $application;
    }

    private function select(string $file, array $bindings = []): array
    {
        return $this->database->select(file_get_contents(database_path($file)), $bindings);
    }

    private function decodePayloads(array $rows): array
    {
        return array_map(function (object $row): object {
            if (isset($row->application_payload)) {
                $row->application_payload = json_decode((string) $row->application_payload, true) ?: [];
            }
            return $row;
        }, $rows);
    }
}
