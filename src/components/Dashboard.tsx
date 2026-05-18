import { useEffect, useState } from 'react';
import { 
  Calendar, 
  FileText, 
  History, 
  LogOut, 
  User, 
  Video, 
  Plus,
  Bell,
  Search,
  ChevronRight,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  onLogout: () => void;
  user: any;
}

export default function Dashboard({ onLogout, user }: DashboardProps) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/patient/${user.NSS}/dashboard`);
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [user.NSS]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <p className="text-zinc-500 font-semibold">Cargando tu portal...</p>
        </div>
      </div>
    );
  }

  const nextAppointment = data?.appointments?.[0];
  const stats = [
    { 
      label: 'Próxima Cita', 
      value: nextAppointment ? new Date(nextAppointment.fecha_hora).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Sin citas', 
      icon: Calendar, 
      color: 'bg-blue-100 text-blue-600' 
    },
    { 
      label: 'Recetas Activas', 
      value: `${data?.prescriptions?.length || 0} Medicamentos`, 
      icon: FileText, 
      color: 'bg-green-100 text-green-600' 
    },
    { 
      label: 'Consultas Realizadas', 
      value: `${data?.records?.length || 0} Totales`, 
      icon: History, 
      color: 'bg-amber-100 text-amber-600' 
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar / Navigation */}
      <nav className="fixed top-0 left-0 h-screen w-20 md:w-64 bg-white border-r border-outline-variant flex flex-col items-center md:items-stretch p-4 md:p-6 z-20">
        <div className="flex items-center gap-3 mb-10 overflow-hidden">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Logo_del_IMSS.svg/1200px-Logo_del_IMSS.svg.png" 
            alt="IMSS Logo" 
            className="w-10 h-10 object-contain shrink-0"
            referrerPolicy="no-referrer"
          />
          <span className="hidden md:block font-display font-bold text-[#006138] truncate">
            {user.primer_nombre} {user.primer_apellido}
          </span>
        </div>

        <ul className="space-y-2 flex-grow">
          <NavItem icon={Calendar} label="Citas" active />
          <NavItem icon={FileText} label="Documentos" />
          <NavItem icon={Video} label="Telemedicina" />
          <NavItem icon={Activity} label="Historial" />
        </ul>

        <button 
          onClick={onLogout}
          className="mt-auto flex items-center gap-3 text-red-500 hover:bg-red-50 p-3 rounded-xl transition-colors cursor-pointer"
        >
          <LogOut size={20} />
          <span className="hidden md:block font-semibold">Cerrar Sesión</span>
        </button>
      </nav>

      {/* Main Content */}
      <main className="pl-20 md:pl-64 pt-6 p-4 md:p-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-display font-bold text-zinc-900 truncate">
              Bienvenido, {user.primer_nombre}
            </h2>
            <p className="text-zinc-500">Aquí tienes un resumen de tu salud hoy.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Buscar receta, doctor..." 
                className="pl-10 pr-4 py-2 bg-white border border-outline-variant rounded-full outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full md:w-64"
              />
            </div>
            <button className="p-2 text-zinc-400 hover:text-primary transition-colors relative">
              <Bell size={24} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant hover:shadow-md transition-shadow"
            >
              <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                <stat.icon size={24} />
              </div>
              <p className="text-sm font-semibold text-zinc-500 mb-1">{stat.label}</p>
              <p className="text-xl font-bold text-zinc-900">{stat.value}</p>
            </motion.div>
          ))}
        </section>

        {/* Main Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Recent Records */}
          <section className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-sm border border-outline-variant overflow-hidden">
              <div className="p-6 border-b border-outline-variant flex items-center justify-between">
                <h3 className="text-xl font-bold text-zinc-900">Historial Reciente</h3>
                <button className="text-primary font-semibold text-sm hover:underline flex items-center gap-1">
                  Ver todo <ChevronRight size={16} />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-50">
                    <tr>
                      <th className="text-left py-4 px-6 text-xs font-bold text-zinc-400 uppercase tracking-widest">Fecha</th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-zinc-400 uppercase tracking-widest">Tipo / Especialidad</th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-zinc-400 uppercase tracking-widest">Médico</th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-zinc-400 uppercase tracking-widest">Hallazgos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {data?.records?.map((record: any, i: number) => (
                      <tr key={i} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="py-4 px-6 text-sm font-medium text-zinc-900">
                          {new Date(record.fecha_hora).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-sm text-zinc-600">{record.especialidad}</td>
                        <td className="py-4 px-6 text-sm text-zinc-600 truncate max-w-[150px]">
                          {record.medico}
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 text-zinc-700">
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {(!data?.records || data.records.length === 0) && (
                      <tr>
                        <td colSpan={4} className="py-10 text-center text-zinc-400 italic">No hay registros médicos recientes</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Quick Actions / Prescriptions */}
          <section className="lg:col-span-4 space-y-6">
            <div className="bg-primary p-6 rounded-2xl text-white shadow-lg overflow-hidden relative">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Prescripciones</h3>
                <p className="text-white/80 text-sm mb-6">Tus medicamentos actuales y dosis recomendadas.</p>
                <div className="space-y-3">
                  {data?.prescriptions?.slice(0, 2).map((p: any, i: number) => (
                    <div key={i} className="bg-white/10 p-3 rounded-lg border border-white/20">
                      <p className="font-bold text-sm">{p.medicamento}</p>
                      <p className="text-xs text-white/70">{p.dosis} - {p.frecuencia}</p>
                    </div>
                  ))}
                  {(!data?.prescriptions || data.prescriptions.length === 0) && (
                    <p className="text-xs text-white/50 italic">Sin recetas activas</p>
                  )}
                </div>
              </div>
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <FileText size={80} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant">
              <h3 className="text-lg font-bold text-zinc-900 mb-4">Unidad Médica</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Activity size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">
                      {data?.appointments?.[0]?.UnidadNombre || 'Buscando unidad...'}
                    </p>
                    <p className="text-xs text-zinc-500">Tu clínica de adscripción</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <li>
      <button className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
        active 
          ? 'bg-primary/10 text-primary font-bold shadow-sm' 
          : 'text-zinc-500 hover:bg-zinc-100'
      }`}>
        <Icon size={20} />
        <span className="hidden md:block">{label}</span>
      </button>
    </li>
  );
}
