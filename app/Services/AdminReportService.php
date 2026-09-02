<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Database\DatabaseManager;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class AdminReportService
{
    private const SQL_PATH = 'sql/admin/reports/';

    public function __construct(private readonly DatabaseManager $database)
    {
    }

    public function reportList(
        ?string $status,
        ?string $severity,
        ?string $search,
        int $limit = 20,
        int $offset = 0,
    ): array {
        $pattern = $search === null || $search === '' ? null : '%'.$search.'%';

        return $this->select(self::SQL_PATH.'report_list.sql', [
            $status, $status,
            $severity, $severity,
            $pattern, $pattern, $pattern, $pattern,
            $limit, $offset,
        ]);
    }

    public function reportDetail(int $id): ?object
    {
        $result = $this->select(self::SQL_PATH.'report_detail.sql', [$id]);

        return $result[0] ?? null;
    }

    public function innerJoinReportReporter(
        ?string $status,
        ?string $severity,
        ?string $search,
    ): array {
        $pattern = $search === null || $search === '' ? null : '%'.$search.'%';

        return $this->select(self::SQL_PATH.'inner_join_report_reporter.sql', [
            $status, $status,
            $severity, $severity,
            $pattern, $pattern, $pattern, $pattern,
        ]);
    }

    public function leftJoinReportIncident(
        ?string $status,
        ?string $severity,
        ?string $search,
    ): array {
        $pattern = $search === null || $search === '' ? null : '%'.$search.'%';

        return $this->select(self::SQL_PATH.'left_join_report_incident.sql', [
            $status, $status,
            $severity, $severity,
            $pattern, $pattern, $pattern, $pattern,
        ]);
    }

    public function reportStatistics(): array
    {
        return $this->select(self::SQL_PATH.'report_statistics.sql');
    }

    public function overviewStats(): array
    {
        $result = $this->select(self::SQL_PATH.'report_overview_stats.sql');
        $row = $result[0] ?? null;

        if ($row === null) {
            return [
                'total_reports' => 0,
                'pending_reports' => 0,
                'verified_reports' => 0,
                'rejected_reports' => 0,
                'closed_reports' => 0,
                'low_severity' => 0,
                'medium_severity' => 0,
                'high_severity' => 0,
                'critical_severity' => 0,
            ];
        }

        return (array) $row;
    }

    public function recentFilteredReports(
        ?string $status,
        ?string $severity,
        int $limit = 20,
        int $offset = 0,
    ): array {
        return $this->select(self::SQL_PATH.'recent_filtered_reports.sql', [
            $status, $status,
            $severity, $severity,
            $limit, $offset,
        ]);
    }

    public function verifyReport(int $id): object
    {
        $result = $this->select(self::SQL_PATH.'report_verify.sql', [$id]);

        if (empty($result)) {
            throw ValidationException::withMessages([
                'report' => ['Report not found or not in pending status.'],
            ]);
        }

        return $result[0];
    }

    public function rejectReport(int $id): object
    {
        $result = $this->select(self::SQL_PATH.'report_reject.sql', [$id]);

        if (empty($result)) {
            throw ValidationException::withMessages([
                'report' => ['Report not found or not in pending status.'],
            ]);
        }

        return $result[0];
    }

    public function closeReport(int $id): object
    {
        $result = $this->select(self::SQL_PATH.'report_close.sql', [$id]);

        if (empty($result)) {
            throw ValidationException::withMessages([
                'report' => ['Report not found or not in a closeable status (pending/verified).'],
            ]);
        }

        return $result[0];
    }

    private function select(string $file, array $bindings = []): array
    {
        return $this->database->select(file_get_contents(database_path($file)), $bindings);
    }
}
