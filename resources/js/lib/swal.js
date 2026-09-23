import Swal from 'sweetalert2';

export const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
});

export const showSuccess = (message, title = 'Berhasil') => {
    return Swal.fire({
        icon: 'success',
        title: title,
        text: message,
        timer: 2500,
        showConfirmButton: false,
        timerProgressBar: true,
    });
};

export const showToastSuccess = (message) => {
    return Toast.fire({
        icon: 'success',
        title: message
    });
};

export const showError = (message, title = 'Terjadi Kesalahan') => {
    return Swal.fire({
        icon: 'error',
        title: title,
        text: message,
        confirmButtonColor: '#e11d48',
        confirmButtonText: 'Tutup'
    });
};

export const showConfirm = async (options = {}) => {
    const result = await Swal.fire({
        title: options.title || 'Apakah Anda yakin?',
        text: options.text || 'Tindakan ini tidak dapat dibatalkan.',
        icon: options.icon || 'warning',
        showCancelButton: true,
        confirmButtonColor: options.confirmColor || '#4f46e5',
        cancelButtonColor: '#94a3b8',
        confirmButtonText: options.confirmText || 'Ya, Lanjutkan',
        cancelButtonText: options.cancelText || 'Batal',
    });
    return result.isConfirmed;
};

export default Swal;
