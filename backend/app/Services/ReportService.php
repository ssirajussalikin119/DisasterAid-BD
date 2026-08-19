<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Report;

class ReportService
{
    public function getAllReports()
    {
        return Report::with('user')->latest()->get();
    }

    public function createReport(array $data): Report
    {
        $data['user_id'] = auth('api')->id();

        return Report::create($data);
    }

    public function getReportById($id): Report
    {
        return Report::with('user')->findOrFail($id);
    }

    public function updateReport($id, array $data): Report
    {
        $report = Report::query()->whereKey($id)->where('user_id', auth('api')->id())->firstOrFail();
        $report->update($data);

        return $report->fresh('user');
    }

    public function deleteReport($id): void
    {
        $report = Report::query()->whereKey($id)->where('user_id', auth('api')->id())->firstOrFail();
        $report->delete();
    }
}
