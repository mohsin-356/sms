import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  SimpleGrid,
  Select,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Progress,
  Icon,
  HStack,
  VStack,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
} from '@chakra-ui/react';
import Card from 'components/card/Card.js';
import MiniStatistics from 'components/card/MiniStatistics';
import IconBox from 'components/icons/IconBox';
import { 
  MdStarRate, 
  MdTrendingUp, 
  MdPeople,
  MdAssignment,
  MdMoreVert,
  MdEdit,
  MdPreview,
  MdAssessment,
  MdBarChart,
  MdTimer,
} from 'react-icons/md';

const TeacherPerformance = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('current-semester');
  
  // Colors
  const textColor = useColorModeValue('gray.800', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Mock performance data
  const performanceData = [
    {
      id: 1,
      teacherId: 'TCH001',
      teacherName: 'Robert Smith',
      photo: 'https://bit.ly/ryan-florence',
      subject: 'Mathematics',
      overall: 92,
      studentFeedback: 90,
      attendance: 98,
      classManagement: 88,
      examResults: 95,
      improvement: '+5%',
      status: 'excellent',
    },
    {
      id: 2,
      teacherId: 'TCH002',
      teacherName: 'Sarah Johnson',
      photo: 'https://bit.ly/sage-adebayo',
      subject: 'Biology',
      overall: 88,
      studentFeedback: 92,
      attendance: 85,
      classManagement: 90,
      examResults: 85,
      improvement: '+2%',
      status: 'good',
    },
    {
      id: 3,
      teacherId: 'TCH003',
      teacherName: 'Michael Brown',
      photo: 'https://bit.ly/kent-c-dodds',
      subject: 'English',
      overall: 78,
      studentFeedback: 75,
      attendance: 80,
      classManagement: 82,
      examResults: 75,
      improvement: '-3%',
      status: 'average',
    },
    {
      id: 4,
      teacherId: 'TCH004',
      teacherName: 'David Wilson',
      photo: 'https://bit.ly/prosper-baba',
      subject: 'Computer Science',
      overall: 95,
      studentFeedback: 94,
      attendance: 97,
      classManagement: 95,
      examResults: 94,
      improvement: '+4%',
      status: 'excellent',
    },
    {
      id: 5,
      teacherId: 'TCH005',
      teacherName: 'Jennifer Lee',
      photo: 'https://bit.ly/code-beast',
      subject: 'Chemistry',
      overall: 83,
      studentFeedback: 85,
      attendance: 78,
      classManagement: 84,
      examResults: 85,
      improvement: '+1%',
      status: 'good',
    },
  ];
  
  // Helper function to get color scheme based on score
  const getColorScheme = (score) => {
    if (score >= 90) return 'green';
    if (score >= 80) return 'blue';
    if (score >= 70) return 'orange';
    return 'red';
  };
  
  // Helper function to get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'green';
      case 'good': return 'blue';
      case 'average': return 'orange';
      case 'needs improvement': return 'red';
      default: return 'gray';
    }
  };
  
  // Calculate overall stats
  const averageOverall = performanceData.reduce((sum, item) => sum + item.overall, 0) / performanceData.length;
  const excellentCount = performanceData.filter(item => item.status === 'excellent').length;
  const needsImprovementCount = performanceData.filter(item => item.status === 'needs improvement').length;
  
  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Page Header */}
      <Flex mb={5} justifyContent="space-between" alignItems="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Teacher Performance</Heading>
          <Text color={textColorSecondary}>Evaluate and track teaching staff performance</Text>
        </Box>
        <Select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          width={{ base: 'full', md: '200px' }}
        >
          <option value="current-semester">Current Semester</option>
          <option value="last-semester">Last Semester</option>
          <option value="annual">Annual</option>
        </Select>
      </Flex>
      
      {/* Performance Overview Cards - redesigned */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={5}>
        <MiniStatistics
          compact
          startContent={<IconBox w='48px' h='48px' bg='linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)' icon={<Icon as={MdStarRate} w='24px' h='24px' color='white' />} />}
          name='Average Rating'
          value={`${averageOverall.toFixed(1)}/100`}
          growth={`${Math.round(averageOverall)}% index`}
          trendData={[70,75,80,85,averageOverall]}
          trendColor='#4facfe'
        />
        <MiniStatistics
          compact
          startContent={<IconBox w='48px' h='48px' bg='linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)' icon={<Icon as={MdTrendingUp} w='24px' h='24px' color='white' />} />}
          name='Excellent Performers'
          value={String(excellentCount)}
          growth={`${Math.round((excellentCount / performanceData.length) * 100)}% of total`}
          trendData={[1,2,2,3,excellentCount]}
          trendColor='#43e97b'
        />
        <MiniStatistics
          compact
          startContent={<IconBox w='48px' h='48px' bg='linear-gradient(135deg,#FFB36D 0%,#FD7853 100%)' icon={<Icon as={MdTimer} w='24px' h='24px' color='white' />} />}
          name='Needs Improvement'
          value={String(needsImprovementCount || 0)}
          growth={`${Math.round(((needsImprovementCount || 0) / performanceData.length) * 100)}% require attention`}
          trendData={[0,1,1,2,needsImprovementCount || 0]}
          trendColor='#FD7853'
        />
      </SimpleGrid>
      
      {/* Performance Table */}
      <Card overflow="hidden">
        <Flex p={4} justifyContent="space-between" alignItems="center" borderBottomWidth={1} borderColor={borderColor}>
          <Text fontSize="lg" fontWeight="medium">Performance Metrics</Text>
          <Button leftIcon={<Icon as={MdAssessment} />} colorScheme="blue" variant="outline">
            Generate Report
          </Button>
        </Flex>
        
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>Teacher</Th>
                <Th>Subject</Th>
                <Th>Student Feedback</Th>
                <Th>Attendance</Th>
                <Th>Class Management</Th>
                <Th>Exam Results</Th>
                <Th>Overall</Th>
                <Th>Status</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {performanceData.map((teacher) => (
                <Tr key={teacher.id}>
                  <Td>
                    <Flex align="center">
                      <Avatar size="sm" src={teacher.photo} name={teacher.teacherName} mr={3} />
                      <Box>
                        <Text fontWeight="medium">{teacher.teacherName}</Text>
                        <Text fontSize="sm" color={textColorSecondary}>{teacher.teacherId}</Text>
                      </Box>
                    </Flex>
                  </Td>
                  <Td>{teacher.subject}</Td>
                  <Td>
                    <HStack>
                      <Progress 
                        value={teacher.studentFeedback} 
                        colorScheme={getColorScheme(teacher.studentFeedback)} 
                        size="sm" 
                        borderRadius="md" 
                        width="100px" 
                      />
                      <Text fontSize="sm">{teacher.studentFeedback}%</Text>
                    </HStack>
                  </Td>
                  <Td>
                    <HStack>
                      <Progress 
                        value={teacher.attendance} 
                        colorScheme={getColorScheme(teacher.attendance)} 
                        size="sm" 
                        borderRadius="md" 
                        width="100px" 
                      />
                      <Text fontSize="sm">{teacher.attendance}%</Text>
                    </HStack>
                  </Td>
                  <Td>
                    <HStack>
                      <Progress 
                        value={teacher.classManagement} 
                        colorScheme={getColorScheme(teacher.classManagement)} 
                        size="sm" 
                        borderRadius="md" 
                        width="100px" 
                      />
                      <Text fontSize="sm">{teacher.classManagement}%</Text>
                    </HStack>
                  </Td>
                  <Td>
                    <HStack>
                      <Progress 
                        value={teacher.examResults} 
                        colorScheme={getColorScheme(teacher.examResults)} 
                        size="sm" 
                        borderRadius="md" 
                        width="100px" 
                      />
                      <Text fontSize="sm">{teacher.examResults}%</Text>
                    </HStack>
                  </Td>
                  <Td>
                    <HStack>
                      <Text fontSize="md" fontWeight="bold" color={`${getColorScheme(teacher.overall)}.500`}>
                        {teacher.overall}%
                      </Text>
                      <Text fontSize="sm" color={teacher.improvement.includes('+') ? 'green.500' : 'red.500'}>
                        {teacher.improvement}
                      </Text>
                    </HStack>
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={getStatusColor(teacher.status)}
                      borderRadius="full"
                      px={2}
                      py={1}
                      textTransform="capitalize"
                    >
                      {teacher.status}
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
                        <MenuItem icon={<Icon as={MdPreview} />}>View Details</MenuItem>
                        <MenuItem icon={<Icon as={MdBarChart} />}>View Analytics</MenuItem>
                        <MenuItem icon={<Icon as={MdEdit} />}>Edit Assessment</MenuItem>
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

export default TeacherPerformance;
