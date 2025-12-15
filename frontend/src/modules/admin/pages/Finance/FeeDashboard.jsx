import React, { useState } from 'react';
import { Box, Flex, Heading, Text, SimpleGrid, Icon, Badge, Button, ButtonGroup, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, Spinner, useToast } from '@chakra-ui/react';
import { MdAttachMoney, MdTrendingUp, MdWarning, MdFileDownload, MdPictureAsPdf, MdDirectionsBus } from 'react-icons/md';
import { FaUserGraduate, FaChalkboardTeacher, FaTruck } from 'react-icons/fa';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
import PieChart from '../../../../components/charts/PieChart';
import { UserTypeFilter } from './components/UserTypeSelector';
import NoUsersWarning from './components/NoUsersWarning';
import { useFinanceUsers, useDashboardStats, useUnifiedInvoices } from '../../../../hooks/useFinanceUsers';

export default function FeeDashboard() {
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const toast = useToast();

  // Hooks
  const { loading: usersLoading, hasUsers, counts } = useFinanceUsers();
  const { loading: statsLoading, stats } = useDashboardStats();
  const { loading: invoicesLoading, invoices } = useUnifiedInvoices({ pageSize: 5 });

  const [roleFilter, setRoleFilter] = useState('all');

  const loading = usersLoading || statsLoading;

  // Safe counts with defaults
  const safeCounts = counts && typeof counts === 'object'
    ? { students: Number(counts.students) || 0, teachers: Number(counts.teachers) || 0, drivers: Number(counts.drivers) || 0 }
    : { students: 0, teachers: 0, drivers: 0 };

  // Calculate role-based totals with null safety
  const getRoleStats = () => {
    const defaultStats = { studentFees: 0, teacherPayroll: 0, driverPayroll: 0, total: 0, collected: 0, outstanding: 0, collectionRate: 0 };
    if (!stats) return defaultStats;

    const studentFees = Number(stats.studentFees?.total) || 0;
    const teacherPayroll = Number(stats.teacherPayroll?.total) || 0;
    const driverPayroll = Number(stats.driverPayroll?.total) || 0;
    const outstanding = Number(stats.studentFees?.outstanding) || 0;
    const paid = Number(stats.studentFees?.paid) || 0;
    const collected = Number(stats.collections?.last30Days) || 0;

    return {
      studentFees,
      teacherPayroll,
      driverPayroll,
      total: studentFees + teacherPayroll + driverPayroll,
      collected,
      outstanding,
      collectionRate: studentFees > 0 ? Math.round((paid / studentFees) * 100) : 0,
    };
  };

  const roleStats = getRoleStats();

  // Invoice status breakdown with null safety
  const statusBreakdown = stats?.invoices
    ? [Number(stats.invoices.paid) || 0, Number(stats.invoices.pending) || 0, Number(stats.invoices.overdue) || 0]
    : [0, 0, 0];

  // Collections with null safety
  const collections = {
    today: Number(stats?.collections?.today) || 0,
    last7Days: Number(stats?.collections?.last7Days) || 0,
    last30Days: Number(stats?.collections?.last30Days) || 0,
  };

  const exportCSV = () => {
    const safeInvoices = invoices || [];
    const header = ['Invoice', 'User Type', 'User', 'Amount', 'Status', 'Date'];
    const data = safeInvoices.map(i => [i.invoiceNumber, i.userType, i.userName, i.total, i.status, i.issuedAt?.slice(0, 10)]);
    const csv = [header, ...data].map(a => a.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recent_invoices.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Exported successfully', status: 'success', duration: 2000 });
  };

  if (loading) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }} textAlign="center">
        <Spinner size="xl" />
        <Text mt={3}>Loading dashboard...</Text>
      </Box>
    );
  }

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Fee Dashboard</Heading>
          <Text color={textColorSecondary}>Unified overview of all financial operations</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue' onClick={exportCSV}>Export CSV</Button>
          <Button leftIcon={<MdPictureAsPdf />} colorScheme='blue'>Export PDF</Button>
        </ButtonGroup>
      </Flex>

      {/* No Users Warning */}
      <NoUsersWarning counts={safeCounts} />

      {/* Role Filter Tabs */}
      <Card p={4} mb={5}>
        <UserTypeFilter value={roleFilter} onChange={setRoleFilter} counts={safeCounts} />
      </Card>

      {/* Role-based Statistics */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5} mb={5}>
        <MiniStatistics
          name="Total Student Fees"
          value={`Rs. ${roleStats.studentFees.toLocaleString()}`}
          startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#00c6ff 0%,#0072ff 100%)' icon={<Icon as={FaUserGraduate} w='28px' h='28px' color='white' />} />}
        />
        <MiniStatistics
          name="Total Teacher Payroll"
          value={`Rs. ${roleStats.teacherPayroll.toLocaleString()}`}
          startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#11998e 0%,#38ef7d 100%)' icon={<Icon as={FaChalkboardTeacher} w='28px' h='28px' color='white' />} />}
        />
        <MiniStatistics
          name="Total Driver Payroll"
          value={`Rs. ${roleStats.driverPayroll.toLocaleString()}`}
          startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#f5576c 0%,#f093fb 100%)' icon={<Icon as={FaTruck} w='28px' h='28px' color='white' />} />}
        />
        <MiniStatistics
          name="Collection Rate"
          value={`${roleStats.collectionRate}%`}
          startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#FDBB2D 0%,#22C1C3 100%)' icon={<Icon as={MdTrendingUp} w='28px' h='28px' color='white' />} />}
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5} mb={5}>
        <MiniStatistics
          name="Today's Collection"
          value={`Rs. ${collections.today.toLocaleString()}`}
          startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#01B574 0%,#319795 100%)' icon={<Icon as={MdAttachMoney} w='28px' h='28px' color='white' />} />}
        />
        <MiniStatistics
          name="Outstanding Fees"
          value={`Rs. ${roleStats.outstanding.toLocaleString()}`}
          startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#f5576c 0%,#f093fb 100%)' icon={<Icon as={MdWarning} w='28px' h='28px' color='white' />} />}
        />
        <MiniStatistics
          name="Last 7 Days"
          value={`Rs. ${collections.last7Days.toLocaleString()}`}
          startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#F6AD55 0%,#ED8936 100%)' icon={<Icon as={MdTrendingUp} w='28px' h='28px' color='white' />} />}
        />
        <MiniStatistics
          name="Last 30 Days"
          value={`Rs. ${collections.last30Days.toLocaleString()}`}
          startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#63B3ED 0%,#4299E1 100%)' icon={<Icon as={MdDirectionsBus} w='28px' h='28px' color='white' />} />}
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5} mb={5}>
        <Card p={4}>
          <Heading size='md' mb={3}>Role-wise Breakdown</Heading>
          <PieChart
            chartData={[roleStats.studentFees, roleStats.teacherPayroll, roleStats.driverPayroll]}
            chartOptions={{
              labels: ['Student Fees', 'Teacher Payroll', 'Driver Payroll'],
              colors: ['#3182CE', '#38A169', '#DD6B20'],
              legend: { position: 'right' }
            }}
          />
        </Card>
        <Card p={4}>
          <Heading size='md' mb={3}>Invoice Status</Heading>
          <PieChart
            chartData={statusBreakdown}
            chartOptions={{
              labels: ['Paid', 'Pending', 'Overdue'],
              colors: ['#38A169', '#ECC94B', '#E53E3E'],
              legend: { position: 'right' }
            }}
          />
        </Card>
      </SimpleGrid>

      {/* Recent Invoices */}
      <Card>
        <Box overflow='hidden'>
          <Heading size='md' p={4} borderBottomWidth={1} borderColor={useColorModeValue('gray.200', 'gray.700')}>
            Recent Invoices
          </Heading>
          <Box maxH='360px' overflowY='auto'>
            <Table variant='simple' size='sm'>
              <Thead position='sticky' top={0} zIndex={1} bg={useColorModeValue('gray.50', 'gray.800')}>
                <Tr>
                  <Th>Invoice</Th>
                  <Th>Type</Th>
                  <Th>User</Th>
                  <Th isNumeric>Amount</Th>
                  <Th>Status</Th>
                  <Th>Date</Th>
                </Tr>
              </Thead>
              <Tbody>
                {invoicesLoading ? (
                  <Tr><Td colSpan={6} textAlign="center"><Spinner /></Td></Tr>
                ) : (!invoices || invoices.length === 0) ? (
                  <Tr><Td colSpan={6} textAlign="center" color="gray.500">No invoices found</Td></Tr>
                ) : invoices.map((i) => (
                  <Tr key={i.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                    <Td><Text fontWeight='600'>{i.invoiceNumber}</Text></Td>
                    <Td>
                      <Badge colorScheme={i.userType === 'student' ? 'blue' : i.userType === 'teacher' ? 'green' : 'orange'}>
                        {i.userType}
                      </Badge>
                    </Td>
                    <Td>{i.userName}</Td>
                    <Td isNumeric>Rs. {Number(i.total || 0).toLocaleString()}</Td>
                    <Td>
                      <Badge colorScheme={i.status === 'paid' ? 'green' : i.status === 'pending' ? 'yellow' : 'red'}>
                        {i.status}
                      </Badge>
                    </Td>
                    <Td><Text color={textColorSecondary}>{i.issuedAt?.slice(0, 10)}</Text></Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
