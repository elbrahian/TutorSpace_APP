import { useState } from 'react';
import { Button } from '../ui/button';

export interface Filtros {
    estado?: 'PENDIENTE' | 'APROBADA' | 'COMPLETADA' | 'CANCELADA';
    fechaInicio?: string;
    fechaFin?: string;
}

interface Props {
    onChange: (filtros: Filtros) => void;
}

export const FiltrosSesiones = ({ onChange }: Props) => {
    const [filtros, setFiltros] = useState<Filtros>({});

    const handleFilterChange = (key: keyof Filtros, value: string) => {
        const newFiltros = { ...filtros, [key]: value || undefined } as Filtros;
        setFiltros(newFiltros);
        onChange(newFiltros);
    };

    const limpiarFiltros = () => {
        const cleanFilters = {};
        setFiltros(cleanFilters);
        onChange(cleanFilters);
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-auto flex-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Estado
                </label>
                <select
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
                    value={filtros.estado || ''}
                    onChange={(e) => handleFilterChange('estado', e.target.value)}
                >
                    <option value="">Todos</option>
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="APROBADA">Aprobada</option>
                    <option value="COMPLETADA">Completada</option>
                    <option value="CANCELADA">Cancelada</option>
                </select>
            </div>
            <div className="w-full md:w-auto flex-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Desde
                </label>
                <input
                    type="date"
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
                    value={filtros.fechaInicio || ''}
                    onChange={(e) => handleFilterChange('fechaInicio', e.target.value)}
                />
            </div>
            <div className="w-full md:w-auto flex-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Hasta
                </label>
                <input
                    type="date"
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
                    value={filtros.fechaFin || ''}
                    onChange={(e) => handleFilterChange('fechaFin', e.target.value)}
                />
            </div>
            <div className="w-full md:w-auto">
                <Button 
                    variant="outline" 
                    onClick={limpiarFiltros}
                    className="w-full md:w-auto"
                >
                    Limpiar filtros
                </Button>
            </div>
        </div>
    );
};
