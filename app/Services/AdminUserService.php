<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Database\DatabaseManager;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class AdminUserService
{
    public function __construct(private readonly DatabaseManager $database)
    {
    }

    public function list(?string $search, ?string $role, ?string $status, int $page, int $perPage): array
    {
        $searchPattern = $search === null || $search === '' ? null : '%'.$search.'%';
        $page = max(1, $page);
        $perPage = min(100, max(1, $perPage));
        $offset = ($page - 1) * $perPage;
        $bindings = [
            $searchPattern, $searchPattern, $searchPattern, $searchPattern,
            $role, $role, $status, $status, $perPage, $offset,
        ];

        $rows = $this->select('user_list.sql', $bindings);
        $countBindings = [
            $searchPattern, $searchPattern, $searchPattern, $searchPattern,
            $role, $role, $status, $status,
        ];
        $total = (int) (($this->select('user_count.sql', $countBindings)[0]->total ?? 0));

        return ['rows' => $rows, 'total' => $total, 'page' => $page, 'per_page' => $perPage];
    }

    public function details(int $id): array
    {
        $profile = $this->select('user_profile.sql', [$id])[0] ?? null;

        if ($profile === null) {
            throw (new ModelNotFoundException())->setModel('users', [$id]);
        }

        return [
            'user' => $profile,
            'activity' => $this->select('user_activity.sql', [$id, $id, $id]),
        ];
    }

    public function usersWithReports(): array
    {
        return $this->select('users_with_reports.sql');
    }

    public function update(int $id, array $data): array
    {
        $row = $this->select('user_update.sql', [$data['name'], $data['email'], $data['phone'], $id])[0] ?? null;

        if ($row === null) {
            throw (new ModelNotFoundException())->setModel('users', [$id]);
        }

        return get_object_vars($row);
    }

    public function changeStatus(int $id, int $adminId, bool $activate): array
    {
        if ($id === $adminId && ! $activate) {
            throw new \InvalidArgumentException('Administrators cannot suspend their own account.');
        }

        $file = $activate ? 'user_activate.sql' : 'user_suspend.sql';
        $row = $this->select($file, [$id])[0] ?? null;

        if ($row === null) {
            throw (new ModelNotFoundException())->setModel('users', [$id]);
        }

        return get_object_vars($row);
    }

    private function select(string $file, array $bindings = []): array
    {
        return $this->database->select(
            file_get_contents(database_path('sql/admin/'.$file)),
            $bindings
        );
    }
}