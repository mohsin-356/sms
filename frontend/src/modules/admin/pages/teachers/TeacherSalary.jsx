import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Flex,
  SimpleGrid,
  Badge,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Input,
  Select,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  HStack,
  useColorModeValue,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import Card from 'components/card/Card.js';
import MiniStatistics from 'components/card/MiniStatistics';
import IconBox from 'components/icons/IconBox';
import { 
  MdAttachMoney, 
  MdCalendarToday, 
  MdPeople, 
  MdLocalPrintshop,
  MdFileDownload,
  MdMoreVert,
  MdSearch,
  MdCheckCircle,
} from 'react-icons/md';

const TeacherSalary = () => {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format
  const toast = useToast();
  
  // Colors
  const textColor = useColorModeValue('gray.800', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Mock salary data
  const salaryData = [
    {
      id: 1,
      teacherId: 'TCH001',
      teacherName: 'Robert Smith',
      designation: 'Senior Math Teacher',
      basicSalary: 50000,
      allowances: 8000,
      deductions: 5000,
      totalSalary: 53000,
      status: 'paid',
      paidOn: '2025-10-05',
      accountDetails: {
        bank: 'ABC Bank',
        accountNumber: '****6789',
      },
    },
    {
      id: 2,
      teacherId: 'TCH002',
      teacherName: 'Sarah Johnson',
      designation: 'Biology Teacher',
      basicSalary: 45000,
      allowances: 6000,
      deductions: 4500,
      totalSalary: 46500,
      status: 'paid',
      paidOn: '2025-10-05',
      accountDetails: {
        bank: 'XYZ Bank',
        accountNumber: '****1234',
      },
    },
    {
      id: 3,
      teacherId: 'TCH003',
      teacherName: 'Michael Brown',
      designation: 'English Teacher',
      basicSalary: 42000,
      allowances: 5500,
      deductions: 4200,
      totalSalary: 43300,
      status: 'processing',
      paidOn: null,
      accountDetails: {
        bank: 'DEF Bank',
        accountNumber: '****5678',
      },
    },
    {
      id: 4,
      teacherId: 'TCH004',
      teacherName: 'David Wilson',
      designation: 'Computer Science Teacher',
      basicSalary: 48000,
      allowances: 7000,
      deductions: 4800,
      totalSalary: 50200,
      status: 'paid',
      paidOn: '2025-10-04',
      accountDetails: {
        bank: 'GHI Bank',
        accountNumber: '****9012',
      },
    },
    {
      id: 5,
      teacherId: 'TCH005',
      teacherName: 'Jennifer Lee',
      designation: 'Chemistry Teacher',
      basicSalary: 46000,
      allowances: 6500,
      deductions: 4600,
      totalSalary: 47900,
      status: 'pending',
      paidOn: null,
      accountDetails: {
        bank: 'JKL Bank',
        accountNumber: '****3456',
      },
    },
  ];
  
  // Calculate summary stats
  const totalSalaryAmount = salaryData.reduce((sum, item) => sum + item.totalSalary, 0);
  const paidCount = salaryData.filter(item => item.status === 'paid').length;
  const pendingCount = salaryData.filter(item => item.status === 'pending' || item.status === 'processing').length;
  
  // Handle process payment
  const handleProcessPayment = (teacherId) => {
    toast({
      title: 'Payment Processed',
      description: `Salary payment for ${teacherId} has been processed successfully.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // Handle bulk process
  const handleBulkProcess = () => {
    toast({
      title: 'Bulk Payment Initiated',
      description: 'All pending salary payments have been initiated.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Page Header */}
      <Flex mb={5} justifyContent="space-between" alignItems="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Teacher Salary Management</Heading>
          <Text color={textColorSecondary}>Process and manage teacher salary payments</Text>
        </Box>
        <HStack>
          <Button
            leftIcon={<Icon as={MdLocalPrintshop} />}
            variant="outline"
            colorScheme="blue"
            size="md"
          >
            Print Report
          </Button>
          <Button
            leftIcon={<Icon as={MdFileDownload} />}
            colorScheme="blue"
            size="md"
          >
            Export Data
          </Button>
        </HStack>
      </Flex>

      {/* Month selector */}
      <Card mb={5}>
        <Flex p={4} direction={{ base: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ base: 'flex-start', md: 'center' }} gap={4}>
          <Box>
            <FormControl>
              <FormLabel>Select Month</FormLabel>
              <Input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                w={{ base: 'full', md: '240px' }}
              />
            </FormControl>
          </Box>
          
          <Button 
            colorScheme="green" 
            size="md" 
            onClick={handleBulkProcess}
            leftIcon={<Icon as={MdCheckCircle} />}
          >
            Process All Pending Payments
          </Button>
        </Flex>
      </Card>

      {/* Stats - redesigned */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={5}>
        <MiniStatistics
          compact
          startContent={<IconBox w='48px' h='48px' bg='linear-gradient(135deg,#01B574 0%,#51CB97 100%)' icon={<Icon as={MdAttachMoney} w='24px' h='24px' color='white' />} />}
          name='Total Salary Budget'
          value={`₹${totalSalaryAmount.toLocaleString()}`}
          growth='+3%'
          trendData={[40,45,43,47,50,55]}
          trendColor='#01B574'
        />
        <MiniStatistics
          compact
          startContent={<IconBox w='48px' h='48px' bg='linear-gradient(135deg,#4481EB 0%,#04BEFE 100%)' icon={<Icon as={MdCheckCircle} w='24px' h='24px' color='white' />} />}
          name='Processed Payments'
          value={String(paidCount)}
          growth='+1%'
          trendData={[1,2,2,3,3,paidCount]}
          trendColor='#4481EB'
        />
        <MiniStatistics
          compact
          startContent={<IconBox w='48px' h='48px' bg='linear-gradient(135deg,#FFB36D 0%,#FD7853 100%)' icon={<Icon as={MdCalendarToday} w='24px' h='24px' color='white' />} />}
          name='Pending Payments'
          value={String(pendingCount)}
          growth='+0%'
          trendData={[pendingCount, pendingCount-1, pendingCount, pendingCount]}
          trendColor='#FD7853'
        />
      </SimpleGrid>

      {/* Salary Table */}
      <Card overflow="hidden">
        <Flex p={4} justifyContent="space-between" alignItems="center" borderBottomWidth={1} borderColor={borderColor}>
          <Text fontSize="lg" fontWeight="medium">Salary Details</Text>
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <Icon as={MdSearch} color="gray.400" />
            </InputLeftElement>
            <Input placeholder="Search by name or ID" />
          </InputGroup>
        </Flex>
        
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>Teacher</Th>
                <Th>Designation</Th>
                <Th isNumeric>Basic Salary</Th>
                <Th isNumeric>Allowances</Th>
                <Th isNumeric>Deductions</Th>
                <Th isNumeric>Total Amount</Th>
                <Th>Status</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {salaryData.map((salary) => (
                <Tr key={salary.id}>
                  <Td>
                    <Box>
                      <Text fontWeight="medium">{salary.teacherName}</Text>
                      <Text fontSize="sm" color={textColorSecondary}>{salary.teacherId}</Text>
                    </Box>
                  </Td>
                  <Td>{salary.designation}</Td>
                  <Td isNumeric>₹{salary.basicSalary.toLocaleString()}</Td>
                  <Td isNumeric>₹{salary.allowances.toLocaleString()}</Td>
                  <Td isNumeric>₹{salary.deductions.toLocaleString()}</Td>
                  <Td isNumeric fontWeight="bold">₹{salary.totalSalary.toLocaleString()}</Td>
                  <Td>
                    <Badge
                      colorScheme={
                        salary.status === 'paid' ? 'green' : 
                        salary.status === 'processing' ? 'blue' : 'orange'
                      }
                      variant="solid"
                      borderRadius="full"
                      px={2}
                      py={1}
                    >
                      {salary.status === 'paid' 
                        ? 'Paid' 
                        : salary.status === 'processing' 
                        ? 'Processing' 
                        : 'Pending'}
                    </Badge>
                  </Td>
                  <Td>
                    <Menu>
                      <MenuButton
                        as={Button}
                        variant="ghost"
                        size="sm"
                        rightIcon={<Icon as={MdMoreVert} />}
                      >
                        Actions
                      </MenuButton>
                      <MenuList>
                        <MenuItem onClick={() => handleProcessPayment(salary.teacherId)}>Process Payment</MenuItem>
                        <MenuItem>View Details</MenuItem>
                        <MenuItem>Download Slip</MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>
    </Box>
  );
};

export default TeacherSalary;
