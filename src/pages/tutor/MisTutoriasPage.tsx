import { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useSesiones } from '../../hooks/useSesiones';
import { FiltrosSesiones } from '../../components/sesiones/FiltrosSesiones';
import type { Filtros } from '../../components/sesiones/FiltrosSesiones';
import { AccionesSesion } from '../../components/sesiones/AccionesSesion';
import { Button } from '../../components/ui/button';
import { ChevronUp, ChevronDown, Calendar, Clock } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';

export default function MisTutoriasPage() {
    const {
        sesiones,
        cargando,
        totalPages,
        totalElements,
        cargarConFiltros,
        ejecutarAccion
    } = useSesiones();

    const [filtros, setFiltros] = useState<Filtros>({});
    const [page, setPage] = useState(0);
    const [sortField, setSortField] = useState<string>('fecha');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const fetchSesiones = useCallback(() => {
        cargarConFiltros({
            ...filtros,
            page,
            size: 10,
            sort: `${sortField},${sortDirection}`
        });
    }, [filtros, page, sortField, sortDirection, cargarConFiltros]);

    useEffect(() => {
        fetchSesiones();
    }, [fetchSesiones]);

    const handleFiltrosChange = (nuevosFiltros: Filtros) => {
        setFiltros(nuevosFiltros);
        setPage(0); // Reset a primera página al cambiar filtros
    };

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const renderSortIcon = (field: string) => {
        if (sortField !== field) return null;
        return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 inline ml-1" /> : <ChevronDown className="w-4 h-4 inline ml-1" />;
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Mis Tutorías</h1>
                    <p className="text-slate-500 mt-1 text-sm md:text-base">Gestiona todas tus sesiones programadas, aprueba solicitudes y marca tutorías completadas.</p>
                </div>

                <FiltrosSesiones onChange={handleFiltrosChange} />

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th
                                        className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        onClick={() => handleSort('nombreEstudiante')}
                                    >
                                        Estudiante {renderSortIcon('nombreEstudiante')}
                                    </th>
                                    <th
                                        className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        onClick={() => handleSort('fecha')}
                                    >
                                        Fecha {renderSortIcon('fecha')}
                                    </th>
                                    <th className="px-6 py-4">Horario</th>
                                    <th
                                        className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        onClick={() => handleSort('estado')}
                                    >
                                        Estado {renderSortIcon('estado')}
                                    </th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {cargando ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                            Cargando sesiones...
                                        </td>
                                    </tr>
                                ) : sesiones.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-500">
                                                <Calendar className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-600" />
                                                <p className="text-lg font-medium text-slate-900 dark:text-white">No se encontraron sesiones</p>
                                                <p className="text-sm">Prueba ajustando los filtros de búsqueda.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    sesiones.map((sesion) => (
                                        <tr key={sesion.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                                {sesion.nombreEstudiante}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDate(sesion.fecha)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                                    <Clock className="w-4 h-4" />
                                                    {sesion.horaInicio.slice(0, 5)} - {sesion.horaFin.slice(0, 5)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${sesion.estado === 'APROBADA' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                                                    sesion.estado === 'COMPLETADA' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' :
                                                        sesion.estado === 'PENDIENTE' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' :
                                                            'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                                                    }`}>
                                                    {sesion.estado}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <AccionesSesion
                                                    sesion={sesion}
                                                    onAccion={ejecutarAccion}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    {!cargando && sesiones.length > 0 && totalPages > 0 && (
                        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                Mostrando página {page + 1} de {totalPages} ({totalElements} resultados)
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                >
                                    Anterior
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={page >= totalPages - 1}
                                >
                                    Siguiente
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
