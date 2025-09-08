import { useState } from 'react';
import { Button, Select, TextInput } from 'flowbite-react';
import CardBox from 'src/components/shared/CardBox';
import Chart from 'react-apexcharts';

type Estado = 'todos' | 'entregado' | 'en_proceso' | 'no_entregado';

const Reportes = () => {
  const [estado, setEstado] = useState<Estado>('todos');
  const [desde, setDesde] = useState<string>('2025-01-01');
  const [hasta, setHasta] = useState<string>('2025-02-01');
  const [conductor, setConductor] = useState<string>('todos');
  const [vehiculo, setVehiculo] = useState<string>('todos');
  const [cliente, setCliente] = useState<string>('todos');

  // Dummy data for charts (replace with API data)
  const fechas = ['01 Ene', '08 Ene', '15 Ene', '22 Ene', '29 Ene'];
  const serieEntregado = [20, 34, 28, 40, 31];
  const serieEnProceso = [5, 8, 7, 10, 6];
  const serieNoEntregado = [2, 4, 3, 5, 4];

  const stackedOptions: any = {
    series: [
      { name: 'Entregado', data: serieEntregado },
      { name: 'En proceso', data: serieEnProceso },
      { name: 'No entregado', data: serieNoEntregado },
    ],
    chart: {
      type: 'bar',
      stacked: true,
      toolbar: { show: false },
      fontFamily: 'inherit',
    },
    colors: ['var(--color-primary)', 'var(--color-warning)', 'var(--color-error)'],
    xaxis: { categories: fechas, labels: { style: { colors: '#a1aab2' } } },
    yaxis: { labels: { style: { colors: '#a1aab2' } } },
    plotOptions: { bar: { columnWidth: '45%', borderRadius: 4 } },
    dataLabels: { enabled: false },
    legend: { position: 'top' },
    grid: { borderColor: 'rgba(0,0,0,.08)' },
    tooltip: { theme: 'dark' },
  };

  const totalEntregado = serieEntregado.reduce((a, b) => a + b, 0);
  const totalProceso = serieEnProceso.reduce((a, b) => a + b, 0);
  const totalNoEntregado = serieNoEntregado.reduce((a, b) => a + b, 0);
  const total = totalEntregado + totalProceso + totalNoEntregado;
  const donutOptions: any = {
    series: [totalEntregado, totalProceso, totalNoEntregado],
    labels: ['Entregado', 'En proceso', 'No entregado'],
    chart: { type: 'donut', fontFamily: 'inherit' },
    colors: ['var(--color-primary)', 'var(--color-warning)', 'var(--color-error)'],
    stroke: { colors: ['var(--color-surface-ld)'], width: 3 },
    plotOptions: { pie: { donut: { size: '75%' } } },
    dataLabels: { enabled: false },
    legend: { show: true },
    tooltip: { theme: 'dark' },
  };

  // Productivity sample (by driver)
  const drivers = ['Juan', 'María', 'Pedro', 'Ana'];
  const entregasDriver = [45, 62, 38, 50];
  const productividadOptions: any = {
    series: [{ data: entregasDriver }],
    chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'inherit' },
    xaxis: { categories: drivers, labels: { style: { colors: '#a1aab2' } } },
    yaxis: { labels: { style: { colors: '#a1aab2' } } },
    plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '45%' } },
    colors: ['var(--color-primary)'],
    dataLabels: { enabled: false },
    grid: { borderColor: 'rgba(0,0,0,.08)' },
    tooltip: { theme: 'dark' },
  };

  return (
    <div className="space-y-6">
      <div className="mt-2">
        <h1 className="text-3xl md:text-4xl font-semibold text-center">Reportes</h1>
        <p className="text-sm text-dark/70 mt-2">Menu&gt;Reportes</p>
      </div>

      {/* Filtros */}
      <CardBox>
        <h5 className="card-title mb-4">Filtros</h5>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-2">
            <Select value={estado} onChange={(e) => setEstado(e.target.value as Estado)}>
              <option value="todos">Todos los estados</option>
              <option value="entregado">Entregadas</option>
              <option value="en_proceso">En proceso</option>
              <option value="no_entregado">No entregadas</option>
            </Select>
          </div>
          <div className="col-span-6 md:col-span-2">
            <TextInput type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          </div>
          <div className="hidden md:flex items-center col-span-12 md:col-span-1 justify-center">hasta</div>
          <div className="col-span-6 md:col-span-2">
            <TextInput type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          </div>
          <div className="col-span-6 md:col-span-1">
            <Select value={conductor} onChange={(e) => setConductor(e.target.value)}>
              <option value="todos">Conductor</option>
              <option value="juan">Juan</option>
              <option value="maria">María</option>
            </Select>
          </div>
          <div className="col-span-6 md:col-span-1">
            <Select value={vehiculo} onChange={(e) => setVehiculo(e.target.value)}>
              <option value="todos">Vehículo</option>
              <option value="v-1">V-1</option>
              <option value="v-2">V-2</option>
            </Select>
          </div>
          <div className="col-span-6 md:col-span-1">
            <Select value={cliente} onChange={(e) => setCliente(e.target.value)}>
              <option value="todos">Cliente</option>
              <option value="acme">ACME</option>
            </Select>
          </div>
          <div className="col-span-12 md:col-span-1 flex md:justify-end">
            <Button color="primary" className="w-full md:w-auto">Aplicar</Button>
          </div>
        </div>
      </CardBox>

      {/* Reporte 1: Cumplimiento de entregas */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-5">
          <CardBox>
            <h5 className="card-title mb-4">Entregas realizadas</h5>
            <Chart options={donutOptions} series={donutOptions.series} type="donut" height={260} />
            <div className="mt-4 grid grid-cols-3 text-center">
              <div>
                <div className="text-sm text-dark/60">Total</div>
                <div className="text-xl font-semibold">{total}</div>
              </div>
              <div>
                <div className="text-sm text-dark/60">% Entregadas</div>
                <div className="text-xl font-semibold">{((totalEntregado/total)*100).toFixed(0)}%</div>
              </div>
              <div>
                <div className="text-sm text-dark/60">% Atrasos</div>
                <div className="text-xl font-semibold">12%</div>
              </div>
            </div>
          </CardBox>
        </div>

        <div className="col-span-12 md:col-span-7">
          <CardBox>
            <h5 className="card-title mb-4">Entregas por día (apiladas)</h5>
            <Chart options={stackedOptions} series={stackedOptions.series} type="bar" height={300} />
          </CardBox>
        </div>
      </div>

      {/* Reporte 2: Productividad */}
      <CardBox>
        <h5 className="card-title mb-4">Productividad por conductor</h5>
        <Chart options={productividadOptions} series={productividadOptions.series} type="bar" height={320} />
      </CardBox>
    </div>
  );
};

export default Reportes;

