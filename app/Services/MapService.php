<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Incident;
use App\Models\Report;
use Illuminate\Support\Facades\DB;

class MapService
{
    private const SEVERITY_ORDER = [
        'low' => 1,
        'medium' => 2,
        'high' => 3,
        'critical' => 4,
    ];

    private const KNOWN_DISTRICTS = [
        'Barguna', 'Barisal', 'Bhola', 'Jhalakathi', 'Patuakhali', 'Pirojpur',
        'Bandarban', 'Brahmanbaria', 'Chandpur', 'Chattogram', 'Comilla', "Cox's Bazar",
        'Feni', 'Khagrachhari', 'Lakshmipur', 'Noakhali', 'Rangamati',
        'Dhaka', 'Faridpur', 'Gazipur', 'Gopalganj', 'Kishoreganj', 'Madaripur',
        'Manikganj', 'Munshiganj', 'Narayanganj', 'Narsingdi', 'Rajbari', 'Tangail',
        'Bagerhat', 'Jashore', 'Jhenaidah', 'Khulna', 'Magura', 'Meherpur', 'Narail', 'Satkhira',
        'Jamalpur', 'Mymensingh', 'Netrokona', 'Sherpur',
        'Bogra', 'Chapai Nawabganj', 'Joypurhat', 'Naogaon', 'Natore', 'Pabna', 'Rajshahi', 'Sirajganj',
        'Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari', 'Panchagarh', 'Rangpur', 'Thakurgaon',
        'Habiganj', 'Moulvibazar', 'Sunamganj', 'Sylhet',
    ];

    public function getMapData(?string $severity = null, ?string $status = null): array
    {
        return [
            'districts' => $this->getDistrictSummaries($severity, $status),
            'markers' => $this->getAllMapMarkers($severity, $status),
        ];
    }

    private function extractDistrictName(?string $district, ?string $location): string
    {
        if (!empty($district)) {
            return trim($district);
        }

        if (empty($location)) {
            return 'Other';
        }

        foreach (self::KNOWN_DISTRICTS as $known) {
            if (stripos($location, $known) !== false) {
                return $known;
            }
        }

        return 'Other';
    }

    private function getDistrictSummaries(?string $severity, ?string $status): array
    {
        $districts = [];

        // 1. Process Verified Incidents
        $incidents = Incident::query()
            ->whereRaw('"verified" = TRUE')
            ->get();

        foreach ($incidents as $incident) {
            $districtName = trim($incident->district);
            $incSeverity = strtolower($incident->severity ?? 'medium');
            $incStatus = strtolower($incident->status ?? 'active');

            if ($severity !== null && $incSeverity !== strtolower($severity)) {
                continue;
            }

            if ($status !== null && $incStatus !== strtolower($status)) {
                continue;
            }

            if (!isset($districts[$districtName])) {
                $districts[$districtName] = [
                    'name' => $districtName,
                    'severity' => $incSeverity,
                    'incident_count' => 0,
                    'verified_report_count' => 0,
                ];
            }

            $districts[$districtName]['incident_count']++;

            if ((self::SEVERITY_ORDER[$incSeverity] ?? 1) > (self::SEVERITY_ORDER[$districts[$districtName]['severity']] ?? 1)) {
                $districts[$districtName]['severity'] = $incSeverity;
            }
        }

        // 2. Aggregate ONLY VERIFIED Reports for public District Disaster Severity
        $verifiedReports = DB::table('reports')
            ->leftJoin('incidents', 'reports.incident_id', '=', 'incidents.id')
            ->select(
                'reports.id',
                'reports.severity',
                'reports.location',
                'incidents.district as incident_district'
            )
            ->where('reports.status', 'verified')
            ->get();

        foreach ($verifiedReports as $rep) {
            $districtName = $this->extractDistrictName($rep->incident_district, $rep->location);
            $repSeverity = strtolower($rep->severity ?? 'medium');

            if ($severity !== null && $repSeverity !== strtolower($severity)) {
                continue;
            }

            if (!isset($districts[$districtName])) {
                $districts[$districtName] = [
                    'name' => $districtName,
                    'severity' => $repSeverity,
                    'incident_count' => 0,
                    'verified_report_count' => 0,
                ];
            }

            $districts[$districtName]['verified_report_count']++;

            // Elevate district disaster severity if verified report has higher severity
            if ((self::SEVERITY_ORDER[$repSeverity] ?? 1) > (self::SEVERITY_ORDER[$districts[$districtName]['severity']] ?? 1)) {
                $districts[$districtName]['severity'] = $repSeverity;
            }
        }

        return array_values($districts);
    }

    private function getAllMapMarkers(?string $severity, ?string $status): array
    {
        $query = DB::table('reports')
            ->leftJoin('incidents', 'reports.incident_id', '=', 'incidents.id')
            ->select(
                'reports.id',
                'reports.title',
                'reports.description',
                'reports.location',
                'reports.latitude',
                'reports.longitude',
                'reports.severity',
                'reports.status',
                'reports.created_at',
                'incidents.district as incident_district'
            )
            ->whereNotNull('reports.latitude')
            ->whereNotNull('reports.longitude')
            ->orderBy('reports.created_at', 'desc');

        if ($severity !== null) {
            $query->where('reports.severity', strtolower($severity));
        }

        if ($status !== null) {
            $query->where('reports.status', strtolower($status));
        }

        $reports = $query->get();

        return $reports->map(function ($row) {
            $districtName = $this->extractDistrictName($row->incident_district, $row->location);
            $reportStatus = strtolower($row->status ?? 'pending');
            $verificationStatus = ($reportStatus === 'verified') ? 'verified' : 'pending';

            return [
                'id' => (int) $row->id,
                'title' => $row->title,
                'description' => $row->description,
                'location' => $row->location,
                'latitude' => (float) $row->latitude,
                'longitude' => (float) $row->longitude,
                'severity' => strtolower($row->severity ?? 'medium'),
                'status' => $reportStatus,
                'verification_status' => $verificationStatus,
                'district' => $districtName,
                'created_at' => $row->created_at,
            ];
        })->toArray();
    }
}
