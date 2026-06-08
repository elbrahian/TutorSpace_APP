import { useState } from 'react';
import type { SesionResponse } from '../../types';
import { ConfirmDialog } from '../shared/ConfirmDialog';

interface Props {
    sesion: SesionResponse;
    onAccion: (tipo: 'confirmar' | 'cancelar' | 'completar' | 'rechazar', id: number) => Promise<void>;
}

export const AccionesSesion = ({ sesion, onAccion }: Props) => {
    const [loading, setLoading] = useState(false);
    const [confirmando, setConfirmando] = useState<string | null>(null);

    const fechaSesionPaso = new Date(sesion.fecha) < new Date();

    const ejecutar = async (tipo: string) => {
        setLoading(true);
        try {
            await onAccion(tipo as any, sesion.id);
        } finally {
            setLoading(false);
            setConfirmando(null);
        }
    };

    if (sesion.estado === 'PENDIENTE') {
        return (
            <div className="flex gap-2">
                <button
                    onClick={() => setConfirmando('confirmar')}
                    disabled={loading}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200"
                >
                    Aprobar
                </button>
                <button
                    onClick={() => setConfirmando('rechazar')}
                    disabled={loading}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
                >
                    Rechazar
                </button>
                {confirmando && (
                    <ConfirmDialog
                        mensaje={`¿Confirmas ${confirmando === 'confirmar' ? 'aprobar' : 'rechazar'} esta sesión?`}
                        onConfirmar={() => ejecutar(confirmando)}
                        onCancelar={() => setConfirmando(null)}
                    />
                )}
            </div>
        );
    }

    if (sesion.estado === 'APROBADA') {
        return (
            <div className="flex gap-2">
                <button onClick={() => setConfirmando('cancelar')} disabled={loading}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">
                    Cancelar
                </button>
                {fechaSesionPaso && (
                    <button onClick={() => setConfirmando('completar')} disabled={loading}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200">
                        Completar
                    </button>
                )}
                {confirmando && (
                    <ConfirmDialog
                        mensaje={`¿Confirmas ${confirmando} esta sesión?`}
                        onConfirmar={() => ejecutar(confirmando)}
                        onCancelar={() => setConfirmando(null)}
                    />
                )}
            </div>
        );
    }

    return <span className="text-sm text-gray-400">—</span>;
};