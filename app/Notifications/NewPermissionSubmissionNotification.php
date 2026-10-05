<?php

namespace App\Notifications;

use App\Models\Permission;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewPermissionSubmissionNotification extends Notification
{
    use Queueable;

    public function __construct(public Permission $permission)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $employeeName = $this->permission->employee->nama ?? $this->permission->user->name ?? 'Karyawan';
        $startDate = Carbon::parse($this->permission->tanggal_mulai)->translatedFormat('d M Y');
        $endDate = $this->permission->tanggal_selesai ? Carbon::parse($this->permission->tanggal_selesai)->translatedFormat('d M Y') : $startDate;
        $dateText = ($startDate === $endDate) ? $startDate : "{$startDate} - {$endDate}";

        return [
            'title' => 'Pengajuan ' . ucfirst($this->permission->category) . ' Baru',
            'message' => "{$employeeName} mengajukan {$this->permission->category} ({$dateText}).",
            'category' => $this->permission->category,
            'action_url' => '/admin/permissions',
            'reference_id' => $this->permission->id,
            'reference_type' => 'permission',
            'user_id' => $this->permission->user_id,
            'employee_name' => $employeeName,
        ];
    }
}
