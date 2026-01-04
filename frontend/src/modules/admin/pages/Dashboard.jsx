
import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  SimpleGrid,
  Text,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  HStack,
  Icon,
  useColorModeValue,
  useToast,
  Avatar,
  Spacer
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

// Icons
import {
  MdPerson,
  MdDirectionsBus,
  MdCheckCircle,
  MdAdd,
  MdBarChart,
  MdTimer,
  MdSearch,
  MdMoreVert,
} from 'react-icons/md';
import { FaUserGraduate, FaChalkboardTeacher, FaBus } from 'react-icons/fa';

// Custom Components
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import BarChart from '../../../components/charts/BarChart';
import RadialAttendance from '../../../components/charts/RadialAttendance';
import Sparkline from '../../../components/charts/Sparkline';
import PieChart from '../../../components/charts/PieChart';
import ApexCharts from 'react-apexcharts'; // Imported for custom charts
import StatCard from '../../../components/card/StatCard';

// Helpers
import { formatNumber, formatCurrency, getStatusColor, formatDate, formatTime } from '../../../utils/helpers';
// API
import * as dashboardApi from '../../../services/api/dashboard';
import * as transportApi from '../../../services/api/transport';

// --- Custom Components ---

// 2. Line Chart Card (NEW - Sales Style)
const LineChartCard = ({ title, categories, series, height = 250, value, label }) => {
  const bg = useColorModeValue('white', 'navy.800');

  const chartOptions = {
    chart: {
      toolbar: { show: false },
      type: 'area', // Area chart for that nice gradient fill
      zoom: { enabled: false }
    },
    stroke: {
      curve: 'smooth',
      width: 3,
      colors: ['#4318FF']
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 90, 100],
        colorStops: [
          { offset: 0, color: "#4318FF", opacity: 0.4 },
          { offset: 100, color: "#4318FF", opacity: 0.0 }
        ]
      }
    },
    xaxis: {
      categories: categories,
      labels: { style: { colors: '#A3AED0', fontSize: '12px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      show: true,
      labels: { style: { colors: '#A3AED0', fontSize: '12px' } }
    },
    grid: {
      strokeDashArray: 5,
      borderColor: '#E6E6E6',
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
    },
    dataLabels: { enabled: false },
    tooltip: {
      theme: 'false',
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        return '<div style="background: #111C44; color: #fff; padding: 10px; border-radius: 10px; font-family: Plus Jakarta Sans; min-width: 120px;">' +
          '<span style="font-size: 10px; opacity: 0.8; display: block; margin-bottom: 5px;">' + w.globals.categoryLabels[dataPointIndex] + '</span>' +
          '<span style="font-size: 16px; font-weight: bold; display: block;">' + series[seriesIndex][dataPointIndex] + '</span>' +
          '</div>'
      }
    }
  };

  return (
    <Box
      bg={bg}
      padding='20px'
      borderRadius='20px'
      boxShadow='0px 10px 30px rgba(112, 144, 176, 0.08)'
      h='100%'
      position='relative'
    >
      <Flex justify='space-between' align='center' mb='20px'>
        <Box>
          <Text fontSize='lg' fontWeight='bold' color='gray.800'>{title}</Text>
          {/* Optional Value Display if needed like the reference image */}
        </Box>

        <HStack spacing='8px' bg='#ffffff' p='5px' borderRadius='10px'>
          <Button size='xs' variant='ghost' color='gray.500'>Week</Button>
          <Button size='xs' variant='ghost' color='gray.500'>Month</Button>
          <Button size='xs' bg='white' color='black' shadow='sm'>Year</Button>
        </HStack>
      </Flex>

      <Box h={height}>
        <ApexCharts options={chartOptions} series={series} type="area" height="100%" />
      </Box>
    </Box>
  );
};


export default function AdminDashboard() {
  const navigate = useNavigate();
  const toast = useToast();

  // -- State --
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    activeBuses: 0,
    todayAttendance: 0,
    recentAlerts: []
  });
  const [buses, setBuses] = useState([]);
  const [attendanceWeekly, setAttendanceWeekly] = useState([]);
  const [feesMonthly, setFeesMonthly] = useState([]);

  // -- Effects --
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [overviewRes, busesRes, attRes, feesRes] = await Promise.all([
          dashboardApi.getOverview(),
          transportApi.listBuses(),
          dashboardApi.getAttendanceWeekly(),
          dashboardApi.getFeesMonthly(),
        ]);

        const ovData = overviewRes?.data || {};
        setOverview({
          totalStudents: Number(ovData.totalStudents) || 0,
          totalTeachers: Number(ovData.totalTeachers) || 0,
          activeBuses: Number(ovData.activeBuses) || 0,
          todayAttendance: Number(ovData.todayAttendance) || 0,
          recentAlerts: Array.isArray(ovData.recentAlerts) ? ovData.recentAlerts : [],
        });

        // Buses
        const busItems = Array.isArray(busesRes?.items) ? busesRes.items : (Array.isArray(busesRes) ? busesRes : []);
        setBuses(busItems);

        // Attendance
        const attItems = Array.isArray(attRes?.data) ? attRes.data : (Array.isArray(attRes) ? attRes : []);
        setAttendanceWeekly(attItems);

        // Fees
        const feeItems = Array.isArray(feesRes?.data) ? feesRes.data : (Array.isArray(feesRes) ? feesRes : []);
        setFeesMonthly(feeItems);

      } catch (e) {
        console.error("Dashboard load failed", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // -- Data Processing for Charts --
  const attendanceToday = useMemo(() => {
    const v = Number(overview.todayAttendance) || 0;
    return Math.max(0, Math.min(100, Math.round(v)));
  }, [overview.todayAttendance]);

  const attendanceBars = useMemo(() => {
    return (attendanceWeekly || []).slice(-7).map((d) => {
      const pct = (Number(d.present) || 0); // Using absolute numbers might be better for Line chart or keep percentage
      const dateObj = new Date(d.day);
      const dayLabel = dateObj.toLocaleDateString(undefined, { weekday: 'short' });
      return { day: dayLabel, value: pct };
    });
  }, [attendanceWeekly]);

  const activitySeries = useMemo(() => {
    // For sparkline
    return attendanceBars.map(d => d.value);
  }, [attendanceBars]);

  const feeMonths = useMemo(() => {
    return (feesMonthly || []).slice(-6).map((m) => {
      const dt = new Date(m.month);
      const label = dt.toLocaleDateString(undefined, { month: 'short' });
      return { month: label, collected: Number(m.collected) || 0 };
    });
  }, [feesMonthly]);

  const feeDonut = useMemo(() => {
    const totalCollected = (feesMonthly || []).reduce((sum, m) => sum + Number(m.collected || 0), 0);
    const totalPending = (feesMonthly || []).reduce((sum, m) => sum + Number(m.pending || 0), 0);
    const total = totalCollected + totalPending;
    const rate = total > 0 ? Math.round((totalCollected / total) * 100) : 0;
    return {
      series: [totalCollected, totalPending],
      labels: ['Collected', 'Pending'],
      rate,
    };
  }, [feesMonthly]);

  const recentAlerts = overview.recentAlerts || [];

  const bgMain = useColorModeValue('#ffffff', 'gray.900');
  const subtleText = useColorModeValue('gray.600', 'gray.400'); // Defined subtleText

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }} bg={bgMain} minH='100vh'>

      {/* Header */}
      <Flex justify='space-between' align='center' mb='30px' px='10px'>
        <VStack align='start' spacing='2px'>
          <Text fontSize='2xl' fontWeight='bold' fontFamily="'Plus Jakarta Sans', sans-serif">
            Good Morning, Admin
          </Text>
          <Text fontSize='sm' color='gray.500'>
            Here is your school overview
          </Text>
        </VStack>
      </Flex>

      {/* --- Section 1: Top Stats Cards (New Design) --- */}
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing='20px' mb='20px'>
        <StatCard
          title="Total Students"
          value={formatNumber(overview.totalStudents)}
          subValue="42 new"
          note="Active in this academic year"
          icon={FaUserGraduate}
          colorScheme="blue"
          trend="up"
          trendValue={5}
        />
        <StatCard
          title="Total Teachers"
          value={formatNumber(overview.totalTeachers)}
          subValue="- 2"
          note="Staff currently signed in"
          icon={FaChalkboardTeacher}
          colorScheme="orange"
          trend="up"
          trendValue={2}
        />
        <StatCard
          title="Active Buses"
          value={overview.activeBuses}
          subValue=""
          note="Vehicles in transit"
          icon={FaBus}
          colorScheme="red"
          trend="down"
          trendValue={5}
        />
        <StatCard
          title="Today's Attendance"
          value={`${overview.todayAttendance}%`}
          subValue=""
          note="Compared to yesterday"
          icon={MdCheckCircle}
          colorScheme="green"
          trend="up"
          trendValue={3}
        />
      </SimpleGrid>

      {/* --- Section 2: Trend Charts (NEW - Upper Section) --- */}
      <SimpleGrid columns={{ base: 1, md: 2 }} gap='20px' mb='20px'>
        <LineChartCard
          title="Weekly Attendance Trend"
          categories={attendanceBars.map(d => d.day)}
          series={[{ name: 'Attendance', data: attendanceBars.map(d => d.value) }]}
          height={280}
        />
        <LineChartCard
          title="Monthly Fee Collection"
          categories={feeMonths.map(d => d.month)}
          series={[{ name: 'Collections', data: feeMonths.map(d => d.collected) }]}
          height={280}
        />
      </SimpleGrid>

      {/* --- Section 3: Charts & Graphs (Restored Content - Shifted Down) --- */}
      <SimpleGrid columns={{ base: 1, md: 3 }} gap='20px' mb='20px'>
        {/* Card 1: Radial Attendance */}
        <Card p='20px' borderRadius='20px' boxShadow='0px 10px 30px rgba(112, 144, 176, 0.08)'>
          <Flex justify='space-between' align='center' mb='8px'>
            <Text fontSize='lg' fontWeight='bold'>Today's Attendance</Text>
            <Badge colorScheme={attendanceToday >= 90 ? 'green' : attendanceToday >= 75 ? 'orange' : 'red'}>
              {attendanceToday >= 90 ? 'Excellent' : attendanceToday >= 75 ? 'Good' : 'Needs Attention'}
            </Badge>
          </Flex>
          <Text fontSize='sm' color={subtleText} mb='10px'>
            Overall attendance rate for today.
          </Text>
          <RadialAttendance ariaLabel="Today's attendance" value={attendanceToday} height={260} label="Attendance" subtitle={`${attendanceToday}%`} />
        </Card>

        {/* Card 2: Fee Collection Donut */}
        <Card p='20px' borderRadius='20px' boxShadow='0px 10px 30px rgba(112, 144, 176, 0.08)'>
          <Flex justify='space-between' align='center' mb='8px'>
            <Text fontSize='lg' fontWeight='bold'>Fee Collection Split</Text>
            <Badge colorScheme={feeDonut.rate >= 80 ? 'green' : feeDonut.rate >= 60 ? 'orange' : 'red'}>
              {feeDonut.rate}%
            </Badge>
          </Flex>
          <Text fontSize='sm' color={subtleText} mb='10px'>
            Last 4 months collected vs pending.
          </Text>
          <PieChart
            type="donut"
            height={260}
            chartData={feeDonut.series}
            chartOptions={{
              labels: feeDonut.labels,
              legend: { position: 'bottom' },
              colors: ['#14b8a6', '#f59e0b'],
            }}
          />
        </Card>

        {/* Card 3: Weekly Activity Sparkline */}
        <Card p='20px' borderRadius='20px' boxShadow='0px 10px 30px rgba(112, 144, 176, 0.08)'>
          <Flex justify='space-between' align='center' mb='8px'>
            <Text fontSize='lg' fontWeight='bold'>Weekly Activity</Text>
            <Badge colorScheme='blue'>Last 7 days</Badge>
          </Flex>
          <Text fontSize='sm' color={subtleText} mb='10px'>
            Attendance trend (proxy for engagement).
          </Text>
          <Sparkline ariaLabel="Weekly activity trend" data={activitySeries} height={140} type="area" />
          <Flex mt={3} justify='space-between' align='center'>
            <Text fontSize='xs' color={subtleText}>Min {Math.min(...activitySeries)}</Text>
            <Text fontSize='xs' color={subtleText}>Max {Math.max(...activitySeries)}</Text>
          </Flex>
        </Card>
      </SimpleGrid>

      {/* --- Section 4: Detailed Stats & Lists (Restored Content) --- */}
      <SimpleGrid columns={{ base: 1, xl: 2 }} gap='20px' mb='20px'>

        {/* Left: Bus Overview */}
        <Card p='20px' borderRadius='20px' boxShadow='0px 10px 30px rgba(112, 144, 176, 0.08)'>
          <Flex justify='space-between' align='center' mb='20px'>
            <Text fontSize='lg' fontWeight='bold'>Bus Overview</Text>
            <Icon as={MdMoreVert} color='gray.400' cursor='pointer' />
          </Flex>
          <Text fontSize='sm' color='gray.500' mb='12px'>
            Snapshot of your registered school buses and their current status.
          </Text>

          <VStack align='stretch' spacing='12px'>
            {buses.length === 0 && <Text fontSize='sm' color='gray.400'>No active buses found.</Text>}
            {buses.slice(0, 3).map((bus) => (
              <Flex
                key={bus.id}
                p='12px'
                bg='gray.50'
                borderRadius='8px'
                justify='space-between'
                align='center'
              >
                <HStack>
                  <Icon
                    as={MdDirectionsBus}
                    color={`${getStatusColor(bus.status)}.500`}
                  />
                  <Box>
                    <Text fontWeight='bold' fontSize='sm'>
                      {bus.number || bus.busNumber}
                    </Text>
                    {bus.driverName && (
                      <Text fontSize='xs' color='gray.500'>
                        Driver: {bus.driverName}
                      </Text>
                    )}
                  </Box>
                </HStack>
                <Badge colorScheme={getStatusColor(bus.status)}>
                  {bus.status}
                </Badge>
              </Flex>
            ))}
          </VStack>

          <Button
            mt='12px'
            w='100%'
            variant='outline'
            colorScheme='blue'
            onClick={() => navigate('/admin/transport/buses')}
          >
            View All Buses
          </Button>
        </Card>

        {/* Right: Alerts & Actions */}
        <Flex direction='column' gap='20px'>
          <Card p='20px' borderRadius='20px' boxShadow='0px 10px 30px rgba(112, 144, 176, 0.08)'>
            <Text fontSize='lg' fontWeight='bold' mb='20px'>Recent Alerts</Text>
            <VStack align='stretch' spacing='12px'>
              {recentAlerts.length === 0 && (
                <Text fontSize='sm' color='gray.500'>No recent alerts.</Text>
              )}
              {recentAlerts.slice(0, 4).map((alert) => (
                <Alert key={alert.id} status={alert.severity === 'error' ? 'error' : 'info'} borderRadius='8px' fontSize='sm'>
                  <AlertIcon />
                  <Box flex='1'>
                    <AlertTitle fontSize='sm'>{alert.title}</AlertTitle>
                    <AlertDescription fontSize='xs'>{alert.message}</AlertDescription>
                  </Box>
                </Alert>
              ))}
            </VStack>
          </Card>

          <Card p='20px' borderRadius='20px' boxShadow='0px 10px 30px rgba(112, 144, 176, 0.08)'>
            <Text fontSize='lg' fontWeight='bold' mb='20px'>Quick Actions</Text>
            <SimpleGrid columns={2} spacing={3}>
              <Button leftIcon={<MdAdd />} colorScheme='blue' size='sm' onClick={() => navigate('/admin/students/add')}>New Student</Button>
              <Button leftIcon={<MdCheckCircle />} colorScheme='green' variant='outline' size='sm' onClick={() => navigate('/admin/attendance/daily')}>Attendance</Button>
              <Button leftIcon={<MdBarChart />} colorScheme='purple' variant='outline' size='sm' onClick={() => navigate('/admin/finance/reports')}>Reports</Button>
              <Button leftIcon={<MdTimer />} colorScheme='orange' variant='outline' size='sm' onClick={() => navigate('/admin/exams')}>Exams</Button>
            </SimpleGrid>
          </Card>
        </Flex>
      </SimpleGrid>

    </Box>
  );
}
