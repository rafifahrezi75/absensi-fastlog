<?php

namespace App\Notifications;

use App\Models\Permission;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PermissionStatusUpdatedNotification extends Notification
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
        $statusText = match ($this->permission->status) {
            'disetujui' => 'Disetujui',
            'ditolak' => 'Ditolak',
            default => ucfirst($this->permission->status),
        };

        $note = $this->permission->catatan_admin ? ' Catatan: ' . $this->permission->catatan_admin : '';

        return [
            'title' => 'Pengajuan ' . ucfirst($this->permission->category) . ' ' . $statusText,
            'message' => "Pengajuan {$this->permission->category} Anda telah {$this->permission->status}.{$note}",
            'category' => $this->permission->category,
            'status' => $this->permission->status,
            'action_url' => '/user/riwayat',
            'reference_id' => $this->permission->id,
            'reference_type' => 'permission',
            'admin_note' => $this->permission->catatan_admin,
        ];
    }
}
