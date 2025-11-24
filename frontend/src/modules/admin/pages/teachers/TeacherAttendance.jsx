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
  Select,
  Button,
  HStack,
  Badge,
  Flex,
  Icon,
  SimpleGrid,
  useColorModeValue,
  FormControl,
  FormLabel,
  Input,
  IconButton,
  Avatar,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { MdCalendarToday, MdCheckCircle, MdCancel, MdAccessTime } from 'react-icons/md';
import Card from 'components/card/Card.js';
import MiniStatistics from 'components/card/MiniStatistics';
import IconBox from 'components/icons/IconBox';

const TeacherAttendance = () => {
  // Date state
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(
    today.toISOString().split('T')[0]
  );
  
  // Colors
  const textColor = useColorModeValue('gray.800', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  
  // Mock teachers data
  const teachers = [
    {
      id: 1,
      name: "Robert Smith",
      photo: "https://bit.ly/ryan-florence",
      department: "Mathematics",
      employeeId: "TCH001"
    },
    {
      id: 2,
      name: "Sarah Johnson",
      photo: "https://bit.ly/sage-adebayo",
      department: "Biology",
      employeeId: "TCH002"
    },
    {
      id: 3,
      name: "Michael Brown",
      photo: "https://bit.ly/kent-c-dodds",
      department: "English",
      employeeId: "TCH003"
    },
    {
      id: 4,
      name: "David Wilson",
      photo: "https://bit.ly/prosper-baba",
      department: "Computer Science",
      employeeId: "TCH004"
    },
    {
      id: 5,
      name: "Jennifer Lee",
      photo: "https://bit.ly/code-beast",
      department: "Chemistry",
      employeeId: "TCH005"
    }
  ];
  
  // Mock attendance data
  const [attendanceData, setAttendanceData] = useState({
    '2025-11-12': {
      1: 'present',
      2: 'present',
      3: 'absent',
      4: 'present',
      5: 'late'
    }
  });
  
  // Initialize attendance for selected date if not exists
  if (!attendanceData[selectedDate]) {
    const newAttendance = {};
    teachers.forEach(teacher => {
      // Generate random attendance for demo purposes
      const status = Math.random() > 0.2 
        ? 'present' 
        : (Math.random() > 0.5 ? 'absent' : 'late');
      
      newAttendance[teacher.id] = status;
    });
    
    setAttendanceData(prev => ({
      ...prev,
      [selectedDate]: newAttendance
    }));
  }
  
  // Handle attendance status change
  const handleStatusChange = (teacherId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        [teacherId]: status
      }
    }));
  };
  
  // Handle date change
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };
  
  // Change date by one day
  const changeDate = (direction) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + direction);
    setSelectedDate(current.toISOString().split('T')[0]);
  };
  
  // Handle save attendance
  const handleSaveAttendance = () => {
    alert(`Attendance for ${formatDate(selectedDate)} has been saved successfully!`);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Calculate attendance stats
  const calculateStats = () => {
    const records = attendanceData[selectedDate] || {};
    const total = Object.keys(records).length;
    const present = Object.values(records).filter(status => status === 'present').length;
    const absent = Object.values(records).filter(status => status === 'absent').length;
    const late = Object.values(records).filter(status => status === 'late').length;
    
    return { present, absent, late, total };
  };
  
  const stats = calculateStats();
  
  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Page Header */}
      <Flex mb={5} justifyContent="space-between" alignItems="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Teacher Attendance</Heading>
          <Text color={textColorSecondary}>Manage and track teacher attendance</Text>
        </Box>
      </Flex>
      
      {/* Date Selector */}
      <Card mb={5}>
        <Flex 
          p={4} 
          justifyContent="space-between" 
          alignItems="center"
          direction={{ base: "column", md: "row" }}
          gap={4}
        >
          <FormControl maxW="300px">
            <FormLabel>Select Date</FormLabel>
            <HStack>
              <IconButton
                icon={<ChevronLeftIcon />}
                onClick={() => changeDate(-1)}
                aria-label="Previous day"
              />
              <Input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                max={today.toISOString().split('T')[0]}
              />
              <IconButton
                icon={<ChevronRightIcon />}
                onClick={() => changeDate(1)}
                isDisabled={selectedDate === today.toISOString().split('T')[0]}
                aria-label="Next day"
              />
            </HStack>
          </FormControl>
          
          <Button 
            colorScheme="blue" 
            size="md"
            onClick={handleSaveAttendance}
            leftIcon={<Icon as={MdCheckCircle} />}
          >
            Save Attendance
          </Button>
        </Flex>
      </Card>
      
      {/* Stats Cards - redesigned */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5} mb={5}>
        <MiniStatistics
          compact
          startContent={<IconBox w='48px' h='48px' bg='linear-gradient(135deg,#4481EB 0%,#04BEFE 100%)' icon={<Icon as={MdCalendarToday} w='24px' h='24px' color='white' />} />}
          name='Total'
          value={String(stats.total)}
          growth={formatDate(selectedDate)}
          trendData={[stats.total-2, stats.total-1, stats.total]}
          trendColor='#4481EB'
        />
        <MiniStatistics
          compact
          startContent={<IconBox w='48px' h='48px' bg='linear-gradient(135deg,#01B574 0%,#51CB97 100%)' icon={<Icon as={MdCheckCircle} w='24px' h='24px' color='white' />} />}
          name='Present'
          value={String(stats.present)}
          growth={`${stats.total>0 ? Math.round((stats.present/stats.total)*100) : 0}% of total`}
          trendData={[1,2,2,3,stats.present]}
          trendColor='#01B574'
        />
        <MiniStatistics
          compact
          startContent={<IconBox w='48px' h='48px' bg='linear-gradient(135deg,#f5576c 0%,#f093fb 100%)' icon={<Icon as={MdCancel} w='24px' h='24px' color='white' />} />}
          name='Absent'
          value={String(stats.absent)}
          growth={`${stats.total>0 ? Math.round((stats.absent/stats.total)*100) : 0}% of total`}
          trendData={[0,1,1,1,stats.absent]}
          trendColor='#f5576c'
        />
        <MiniStatistics
          compact
          startContent={<IconBox w='48px' h='48px' bg='linear-gradient(135deg,#FFB36D 0%,#FD7853 100%)' icon={<Icon as={MdAccessTime} w='24px' h='24px' color='white' />} />}
          name='Late'
          value={String(stats.late)}
          growth={`${stats.total>0 ? Math.round((stats.late/stats.total)*100) : 0}% of total`}
          trendData={[0,1,1,2,stats.late]}
          trendColor='#FD7853'
        />
      </SimpleGrid>
      
      {/* Attendance Table */}
      <Card overflow="hidden">
        <Heading size="md" p={4} borderBottomWidth={1} borderColor={useColorModeValue("gray.200", "gray.700")}>
          Attendance Record - {formatDate(selectedDate)}
        </Heading>
        
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>Teacher</Th>
                <Th>ID</Th>
                <Th>Department</Th>
                <Th width="200px">Status</Th>
                <Th>Time In</Th>
                <Th>Time Out</Th>
              </Tr>
            </Thead>
            <Tbody>
              {teachers.map(teacher => {
                const attendanceStatus = 
                  attendanceData[selectedDate]?.[teacher.id] || 'absent';
                
                return (
                  <Tr key={teacher.id}>
                    <Td>
                      <Flex align="center">
                        <Avatar src={teacher.photo} name={teacher.name} size="sm" mr={3} />
                        <Text fontWeight="medium">{teacher.name}</Text>
                      </Flex>
                    </Td>
                    <Td>{teacher.employeeId}</Td>
                    <Td>{teacher.department}</Td>
                    <Td>
                      <Select
                        value={attendanceStatus}
                        onChange={(e) => handleStatusChange(teacher.id, e.target.value)}
                        width="full"
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                      </Select>
                    </Td>
                    <Td>
                      {attendanceStatus === 'present' || attendanceStatus === 'late' ? 
                        (attendanceStatus === 'late' ? '09:15 AM' : '08:30 AM') : 
                        '-'}
                    </Td>
                    <Td>
                      {attendanceStatus === 'present' ? '04:30 PM' : '-'}
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      </Card>
    </Box>
  );
};

export default TeacherAttendance;
