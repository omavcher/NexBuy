import React from 'react';
import { 
    BarChart, 
    LineChart, 
    PieChart, 
    Bar, 
    Line, 
    Pie, 
    Cell, 
    CartesianGrid, 
    XAxis, 
    YAxis, 
    Tooltip, 
    ResponsiveContainer 
} from 'recharts';
import '../pages/css/Dashboard.css'; 

const data = [
    { name: 'Jan', sales: 4000, visitors: 2400 },
    { name: 'Feb', sales: 3000, visitors: 1398 },
    { name: 'Mar', sales: 2000, visitors: 9800 },
    { name: 'Apr', sales: 2780, visitors: 3908 },
    { name: 'May', sales: 1890, visitors: 4800 },
    { name: 'Jun', sales: 2390, visitors: 3800 },
    { name: 'Jul', sales: 3490, visitors: 4300 },
];

const pieData = [
    { name: 'Product A', value: 400 },
    { name: 'Product B', value: 300 },
    { name: 'Product C', value: 300 },
    { name: 'Product D', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const CustomTooltip = ({ payload, label }) => {
    if (payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p className="label">{`${label} : ${payload[0].value}`}</p>
            </div>
        );
    }

    return null;
};

const Analytics = () => {
    return (
        <div className="analytics">
            <h2>Sales and Statistics</h2>
            <div className="charts-container">
                <div className="chart">
                    <h3>Sales Overview</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="sales" fill="#da3023" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart">
                    <h3>Visitor Trends</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="visitors" stroke="#8884d8" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart">
                    <h3>Product Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8">
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
