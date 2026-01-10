import Link from "next/link";
import { MoveLeft, Ghost } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
            <div className="text-center max-w-md">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500">
                    <Ghost size={48} />
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-2">404</h1>
                <h2 className="text-xl font-bold text-slate-800 mb-4">Halaman Tidak Ditemukan</h2>
                <p className="text-slate-500 mb-8">
                    Maaf, halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau tidak tersedia.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all active:scale-95"
                >
                    <MoveLeft size={18} />
                    Kembali ke Beranda
                </Link>
            </div>
        </div>
    );
}
