import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import './PieChart.scss'; // Importăm fișierul de stiluri

const PieChart = ({ type }) => {
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:3000/admin/stats');
                if (response.ok) {
                    const data = await response.json();
                    if (type === 'utilizatori-anunturi') {
                        setChartData({
                            labels: ['Utilizatori', 'Anunțuri'],
                            datasets: [
                                {
                                    label: 'În număr de',
                                    data: [data.numUtilizatori, data.numAnunturi],
                                    backgroundColor: ['#36A2EB', '#FF6384'],
                                    hoverBackgroundColor: ['#36A2EB', '#FF6384'],
                                },
                            ],
                        });
                    } else if (type === 'proprietati-categorii') {
                        const labels = data.categorii.map(item => item.denumire);
                        const values = data.categorii.map(item => item.numProprietati);
                        setChartData({
                            labels,
                            datasets: [
                                {
                                    label: 'Proprietăți în această categorie',
                                    data: values,
                                    backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
                                    hoverBackgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
                                },
                            ],
                        });
                    } else if(type === 'statusuri'){
                        const labels = data.statusuri.map(item => item.status);
                        const values = data.statusuri.map(item => item.numStatusuri);
                        setChartData({
                            labels,
                            datasets: [
                                {
                                    label: 'Proprietăți cu acest status',
                                    data: values,
                                    backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
                                    hoverBackgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
                                },
                            ],
                        });
                    } else if(type === 'proprietati-orase'){
                        const labels = data.orase.map(item => item.oras);
                        const values = data.orase.map(item => item.numProprietati);
                        setChartData({
                            labels,
                            datasets: [
                                {
                                    label: 'Proprietăți în acest oraș',
                                    data: values,
                                    backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
                                    hoverBackgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
                                },
                            ],
                        });
                    }
                } else {
                    console.error('Eroare la obținerea statisticilor.');
                }
            } catch (error) {
                console.error('Eroare de rețea:', error);
            }
        };

        fetchData();
    }, [type]);

    return (
        <div className="pie-chart-container">
           <h2>
                {type === 'utilizatori-anunturi' ? 'Utilizatori/Anunțuri' :
                type === 'proprietati-categorii' ? 'Proprietăți/Tip Proprietate' :
                type === 'statusuri' ? 'Anunțuri/Categorii' :
                'Proprietăți/Orașe'}
            </h2>
            {chartData ? <Pie data={chartData} width={300} height={300} /> : <p>Încărcare...</p>}
        </div>
    );
};

export default PieChart;