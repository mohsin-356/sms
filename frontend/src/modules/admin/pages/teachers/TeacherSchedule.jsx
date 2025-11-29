import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  SimpleGrid,
  Button,
  Select,
  HStack,
  VStack,
  Badge,
  Icon,
  useDisclosure,
  useColorModeValue,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Avatar,
} from '@chakra-ui/react';
import Card from 'components/card/Card.js';
import MiniStatistics from 'components/card/MiniStatistics';
import IconBox from 'components/icons/IconBox';
import { 
  MdSchedule,
  MdPerson,
  MdToday,
  MdClass,
  MdFilterList,
  MdEdit,
  MdAdd,
  MdSupervisorAccount,
  MdRefresh,
} from 'react-icons/md';

const TeacherSchedule = () => {
  const [selectedTeacher, setSelectedTeacher] = useState('all');
  const [selectedDay, setSelectedDay] = useState('all');
  
  // Colors
  const textColor = useColorModeValue('gray.800', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const bgPeriod = useColorModeValue('gray.50', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  
  // Time slots
  const timeSlots = [
    { id: 1, start: '08:00', end: '08:45', label: '1st Period' },
    { id: 2, start: '08:50', end: '09:35', label: '2nd Period' },
    { id: 3, start: '09:40', end: '10:25', label: '3rd Period' },
    { id: 4, start: '10:30', end: '11:15', label: '4th Period' },
    { id: 5, start: '11:20', end: '12:05', label: '5th Period' },
    { id: 6, start: '12:05', end: '12:45', label: 'Lunch Break' },
    { id: 7, start: '12:50', end: '13:35', label: '6th Period' },
    { id: 8, start: '13:40', end: '14:25', label: '7th Period' },
    { id: 9, start: '14:30', end: '15:15', label: '8th Period' },
  ];

  // Days of week
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Mock teachers data
  const teachers = [
    { id: 1, name: 'Robert Smith', photo: 'https://bit.ly/ryan-florence', subject: 'Mathematics' },
    { id: 2, name: 'Sarah Johnson', photo: 'https://bit.ly/sage-adebayo', subject: 'Biology' },
    { id: 3, name: 'Michael Brown', photo: 'https://bit.ly/kent-c-dodds', subject: 'English' },
    { id: 4, name: 'David Wilson', photo: 'https://bit.ly/prosper-baba', subject: 'Computer Science' },
    { id: 5, name: 'Jennifer Lee', photo: 'https://bit.ly/code-beast', subject: 'Chemistry' },
  ];
  
  // Mock schedule data
  const [scheduleData, setScheduleData] = useState([
    // Monday
    { id: 1, day: 'Monday', timeSlot: 1, teacherId: 1, class: '10A', subject: 'Mathematics', room: 'R101' },
    { id: 2, day: 'Monday', timeSlot: 2, teacherId: 2, class: '9A', subject: 'Biology', room: 'R102' },
    { id: 3, day: 'Monday', timeSlot: 3, teacherId: 3, class: '11C', subject: 'English', room: 'R103' },
    { id: 4, day: 'Monday', timeSlot: 4, teacherId: 1, class: '11A', subject: 'Mathematics', room: 'R104' },
    { id: 5, day: 'Monday', timeSlot: 5, teacherId: 5, class: '10C', subject: 'Chemistry', room: 'R105' },
    { id: 6, day: 'Monday', timeSlot: 7, teacherId: 4, class: '12B', subject: 'Computer Science', room: 'Lab 1' },
    { id: 7, day: 'Monday', timeSlot: 8, teacherId: 2, class: '10B', subject: 'Biology', room: 'R102' },
    { id: 8, day: 'Monday', timeSlot: 9, teacherId: 5, class: '11A', subject: 'Chemistry', room: 'R105' },
    
    // Tuesday
    { id: 9, day: 'Tuesday', timeSlot: 1, teacherId: 3, class: '9B', subject: 'English', room: 'R103' },
    { id: 10, day: 'Tuesday', timeSlot: 2, teacherId: 1, class: '12A', subject: 'Mathematics', room: 'R101' },
    { id: 11, day: 'Tuesday', timeSlot: 3, teacherId: 5, class: '11A', subject: 'Chemistry', room: 'R105' },
    { id: 12, day: 'Tuesday', timeSlot: 4, teacherId: 4, class: '9C', subject: 'Computer Science', room: 'Lab 1' },
    { id: 13, day: 'Tuesday', timeSlot: 5, teacherId: 2, class: '11A', subject: 'Biology', room: 'R102' },
    { id: 14, day: 'Tuesday', timeSlot: 7, teacherId: 3, class: '10C', subject: 'English', room: 'R103' },
    { id: 15, day: 'Tuesday', timeSlot: 8, teacherId: 1, class: '10A', subject: 'Mathematics', room: 'R101' },
    { id: 16, day: 'Tuesday', timeSlot: 9, teacherId: 4, class: '8A', subject: 'Computer Science', room: 'Lab 1' },
    
    // Wednesday
    { id: 17, day: 'Wednesday', timeSlot: 1, teacherId: 5, class: '11A', subject: 'Chemistry', room: 'R105' },
    { id: 18, day: 'Wednesday', timeSlot: 2, teacherId: 3, class: '11C', subject: 'English', room: 'R103' },
    { id: 19, day: 'Wednesday', timeSlot: 3, teacherId: 2, class: '9A', subject: 'Biology', room: 'R102' },
    { id: 20, day: 'Wednesday', timeSlot: 4, teacherId: 1, class: '12A', subject: 'Mathematics', room: 'R101' },
    { id: 21, day: 'Wednesday', timeSlot: 5, teacherId: 4, class: '12B', subject: 'Computer Science', room: 'Lab 1' },
    { id: 22, day: 'Wednesday', timeSlot: 7, teacherId: 1, class: '11B', subject: 'Mathematics', room: 'R101' },
    { id: 23, day: 'Wednesday', timeSlot: 8, teacherId: 5, class: '10C', subject: 'Chemistry', room: 'R105' },
    { id: 24, day: 'Wednesday', timeSlot: 9, teacherId: 3, class: '9B', subject: 'English', room: 'R103' },
    
    // Thursday
    { id: 25, day: 'Thursday', timeSlot: 1, teacherId: 2, class: '10B', subject: 'Biology', room: 'R102' },
    { id: 26, day: 'Thursday', timeSlot: 2, teacherId: 4, class: '8A', subject: 'Computer Science', room: 'Lab 1' },
    { id: 27, day: 'Thursday', timeSlot: 3, teacherId: 1, class: '10A', subject: 'Mathematics', room: 'R101' },
    { id: 28, day: 'Thursday', timeSlot: 4, teacherId: 3, class: '9B', subject: 'English', room: 'R103' },
    { id: 29, day: 'Thursday', timeSlot: 5, teacherId: 5, class: '11A', subject: 'Chemistry', room: 'R105' },
    { id: 30, day: 'Thursday', timeSlot: 7, teacherId: 2, class: '9A', subject: 'Biology', room: 'R102' },
    { id: 31, day: 'Thursday', timeSlot: 8, teacherId: 4, class: '12B', subject: 'Computer Science', room: 'Lab 1' },
    { id: 32, day: 'Thursday', timeSlot: 9, teacherId: 1, class: '11A', subject: 'Mathematics', room: 'R101' },
    
    // Friday
    { id: 33, day: 'Friday', timeSlot: 1, teacherId: 4, class: '9C', subject: 'Computer Science', room: 'Lab 1' },
    { id: 34, day: 'Friday', timeSlot: 2, teacherId: 5, class: '11A', subject: 'Chemistry', room: 'R105' },
    { id: 35, day: 'Friday', timeSlot: 3, teacherId: 3, class: '10C', subject: 'English', room: 'R103' },
    { id: 36, day: 'Friday', timeSlot: 4, teacherId: 2, class: '11A', subject: 'Biology', room: 'R102' },
    { id: 37, day: 'Friday', timeSlot: 5, teacherId: 1, class: '12A', subject: 'Mathematics', room: 'R101' },
    { id: 38, day: 'Friday', timeSlot: 7, teacherId: 5, class: '12C', subject: 'Chemistry', room: 'R105' },
    { id: 39, day: 'Friday', timeSlot: 8, teacherId: 3, class: '11C', subject: 'English', room: 'R103' },
    { id: 40, day: 'Friday', timeSlot: 9, teacherId: 2, class: '10B', subject: 'Biology', room: 'R102' },
  ]);
  
  // Filter schedule data based on selected teacher and day
  const filteredSchedule = scheduleData.filter(item => {
    if (selectedTeacher !== 'all' && parseInt(selectedTeacher) !== item.teacherId) {
      return false;
    }
    if (selectedDay !== 'all' && selectedDay !== item.day) {
      return false;
    }
    return true;
  });
  
  // Get teacher name by ID
  const getTeacherById = (id) => {
    const teacher = teachers.find(t => t.id === id);
    return teacher ? teacher.name : 'Unknown';
  };

  // Get teacher photo by ID
  const getTeacherPhotoById = (id) => {
    const teacher = teachers.find(t => t.id === id);
    return teacher ? teacher.photo : '';
  };
  
  // Schedule stats
  const totalClasses = scheduleData.length;
  const classesPerDay = weekDays.map(day => ({
    day,
    count: scheduleData.filter(item => item.day === day).length
  }));
  const busyTeacher = [...teachers]
    .map(teacher => ({
      ...teacher,
      classes: scheduleData.filter(item => item.teacherId === teacher.id).length
    }))
    .sort((a, b) => b.classes - a.classes)[0];

  // Get subject color
  const getSubjectColor = (subject) => {
    switch (subject) {
      case 'Mathematics': return 'blue';
      case 'Biology': return 'green';
      case 'English': return 'purple';
      case 'Computer Science': return 'orange';
      case 'Chemistry': return 'pink';
      default: return 'gray';
    }
  };
  
  // Create schedule modal state and handlers
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [newSchedule, setNewSchedule] = useState({
    day: '',
    timeSlot: '',
    teacherId: '',
    class: '',
    subject: '',
    room: '',
  });

  const handleCreateSchedule = () => {
    if (!newSchedule.day || !newSchedule.timeSlot || !newSchedule.teacherId || !newSchedule.class || !newSchedule.subject || !newSchedule.room) {
      toast({ title: 'Please fill all fields', status: 'warning', duration: 2000 });
      return;
    }
    const nextId = (scheduleData[scheduleData.length - 1]?.id || 0) + 1;
    const item = {
      id: nextId,
      day: newSchedule.day,
      timeSlot: parseInt(newSchedule.timeSlot),
      teacherId: parseInt(newSchedule.teacherId),
      class: newSchedule.class,
      subject: newSchedule.subject,
      room: newSchedule.room,
    };
    setScheduleData([...scheduleData, item]);
    onClose();
    setNewSchedule({ day: '', timeSlot: '', teacherId: '', class: '', subject: '', room: '' });
    toast({ title: 'Schedule created', status: 'success', duration: 2000 });
  };
  
  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Page Header */}
      <Flex mb={5} justifyContent="space-between" alignItems="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Teacher Schedule</Heading>
          <Text color={textColorSecondary}>Manage class schedule for all teachers</Text>
        </Box>
        <Button
          leftIcon={<Icon as={MdAdd} />}
          colorScheme="blue"
          size="md"
          onClick={onOpen}
        >
          Create New Schedule
        </Button>
      </Flex>
      
      {/* Create Schedule Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Schedule</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Day</FormLabel>
                <Select
                  placeholder="Select day"
                  value={newSchedule.day}
                  onChange={(e) => setNewSchedule((s) => ({ ...s, day: e.target.value }))}
                >
                  {weekDays.map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Time Slot</FormLabel>
                <Select
                  placeholder="Select time slot"
                  value={newSchedule.timeSlot}
                  onChange={(e) => setNewSchedule((s) => ({ ...s, timeSlot: e.target.value }))}
                >
                  {timeSlots.map((t) => (
                    <option key={t.id} value={t.id}>{`${t.label} (${t.start}-${t.end})`}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Teacher</FormLabel>
                <Select
                  placeholder="Select teacher"
                  value={newSchedule.teacherId}
                  onChange={(e) => setNewSchedule((s) => ({ ...s, teacherId: e.target.value }))}
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Subject</FormLabel>
                <Input
                  placeholder="e.g. Mathematics"
                  value={newSchedule.subject}
                  onChange={(e) => setNewSchedule((s) => ({ ...s, subject: e.target.value }))}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Class</FormLabel>
                <Input
                  placeholder="e.g. 10A"
                  value={newSchedule.class}
                  onChange={(e) => setNewSchedule((s) => ({ ...s, class: e.target.value }))}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Room</FormLabel>
                <Input
                  placeholder="e.g. R101"
                  value={newSchedule.room}
                  onChange={(e) => setNewSchedule((s) => ({ ...s, room: e.target.value }))}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
            <Button colorScheme="blue" onClick={handleCreateSchedule}>Create</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Stats Cards - redesigned */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={5}>
        <MiniStatistics
          compact
          startContent={<IconBox w='48px' h='48px' bg='linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)' icon={<Icon as={MdSchedule} w='24px' h='24px' color='white' />} />}
          name='Total Classes'
          value={String(totalClasses)}
          growth='Across all teachers'
          trendData={[totalClasses-5,totalClasses-2,totalClasses]}
          trendColor='#4facfe'
        />
        <MiniStatistics
          compact
          startContent={<IconBox w='48px' h='48px' bg='linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)' icon={<Icon as={MdToday} w='24px' h='24px' color='white' />} />}
          name='Busiest Day'
          value={classesPerDay.sort((a, b) => b.count - a.count)[0].day}
          growth={`${classesPerDay.sort((a, b) => b.count - a.count)[0].count} classes scheduled`}
          trendData={classesPerDay.map(x=>x.count)}
          trendColor='#43e97b'
        />
        <MiniStatistics
          compact
          startContent={<IconBox w='48px' h='48px' bg='linear-gradient(135deg,#a18cd1 0%,#fbc2eb 100%)' icon={<Icon as={MdSupervisorAccount} w='24px' h='24px' color='white' />} />}
          name='Most Classes'
          value={busyTeacher.name}
          growth={`${busyTeacher.classes} classes/week`}
          trendData={[busyTeacher.classes-2,busyTeacher.classes-1,busyTeacher.classes]}
          trendColor='#a18cd1'
        />
      </SimpleGrid>
      
      {/* Filters */}
      <Card mb={5}>
        <Flex 
          p={4} 
          direction={{ base: 'column', md: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ base: 'flex-start', md: 'center' }}
          gap={4}
        >
          <HStack spacing={4}>
            <Select
              icon={<MdPerson />}
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              width="200px"
              placeholder="Select Teacher"
            >
              <option value="all">All Teachers</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </Select>
            
            <Select
              icon={<MdToday />}
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              width="200px"
              placeholder="Select Day"
            >
              <option value="all">All Days</option>
              {weekDays.map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </Select>
          </HStack>
          
          <Button
            leftIcon={<Icon as={MdRefresh} />}
            variant="outline"
            colorScheme="blue"
            onClick={() => {
              setSelectedTeacher('all');
              setSelectedDay('all');
            }}
          >
            Reset Filters
          </Button>
        </Flex>
      </Card>
      
      {/* Schedule Table */}
      <Card overflow="hidden">
        <Flex p={4} justifyContent="space-between" alignItems="center" borderBottomWidth={1} borderColor={borderColor}>
          <Text fontSize="lg" fontWeight="medium">Class Schedule</Text>
          <HStack>
            <Button leftIcon={<Icon as={MdFilterList} />} variant="ghost">
              Sort
            </Button>
            <Button leftIcon={<Icon as={MdEdit} />} variant="ghost">
              Edit
            </Button>
          </HStack>
        </Flex>
        
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>Day</Th>
                <Th>Time</Th>
                <Th>Teacher</Th>
                <Th>Subject</Th>
                <Th>Class</Th>
                <Th>Room</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredSchedule.length === 0 ? (
                <Tr>
                  <Td colSpan={6} textAlign="center" py={6}>
                    <Text color={textColorSecondary}>No classes scheduled for the selected filters.</Text>
                  </Td>
                </Tr>
              ) : (
                filteredSchedule
                  .sort((a, b) => {
                    const dayOrder = weekDays.indexOf(a.day) - weekDays.indexOf(b.day);
                    if (dayOrder !== 0) return dayOrder;
                    return a.timeSlot - b.timeSlot;
                  })
                  .map((schedule) => {
                    const timeSlot = timeSlots.find(t => t.id === schedule.timeSlot);
                    return (
                      <Tr key={schedule.id} _hover={{ bg: hoverBg }}>
                        <Td>{schedule.day}</Td>
                        <Td>
                          <VStack align="flex-start" spacing={0}>
                            <Text fontWeight="medium">
                              {timeSlot ? `${timeSlot.start} - ${timeSlot.end}` : ''}
                            </Text>
                            <Text fontSize="xs" color={textColorSecondary}>
                              {timeSlot ? timeSlot.label : ''}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Flex align="center">
                            <Avatar 
                              size="sm" 
                              src={getTeacherPhotoById(schedule.teacherId)} 
                              name={getTeacherById(schedule.teacherId)} 
                              mr={2}
                            />
                            <Text fontWeight="medium">{getTeacherById(schedule.teacherId)}</Text>
                          </Flex>
                        </Td>
                        <Td>
                          <Badge colorScheme={getSubjectColor(schedule.subject)} px={2} py={1}>
                            {schedule.subject}
                          </Badge>
                        </Td>
                        <Td>{schedule.class}</Td>
                        <Td>{schedule.room}</Td>
                      </Tr>
                    );
                  })
              )}
            </Tbody>
          </Table>
        </Box>
      </Card>
    </Box>
  );
};

export default TeacherSchedule;
