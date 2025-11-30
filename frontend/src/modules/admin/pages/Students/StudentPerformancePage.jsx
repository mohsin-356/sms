import React, { useEffect, useState } from 'react';
import { Box, Text, Flex, Button, SimpleGrid, Badge, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Select, Progress, useToast } from '@chakra-ui/react';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
// Icons
import { MdSchool, MdGrade, MdStar, MdStarBorder, MdTrendingUp, MdSearch, MdFilterList, MdRemoveRedEye, MdMoreVert, MdAssignment } from 'react-icons/md';
// API
import * as studentsApi from '../../../../services/api/students';

export default function StudentPerformancePage() {
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(false);
  const [perf, setPerf] = useState({ average: 0, totalExams: 0, subjects: [], recentResults: [] });

  // Load students
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await studentsApi.list({ pageSize: 200 });
        const rows = Array.isArray(data?.rows) ? data.rows : data;
        setStudents(rows || []);
        if ((rows || []).length) setSelectedId(String(rows[0].id));
      } catch (e) {
        toast({ title: 'Failed to load students', status: 'error' });
      }
    };
    load();
  }, []);

  // Load performance for selected
  useEffect(() => {
    if (!selectedId) return;
    const loadPerf = async () => {
      try {
        setLoading(true);
        const { data } = await studentsApi.getPerformance(selectedId);
        setPerf(data || { average: 0, totalExams: 0, subjects: [], recentResults: [] });
      } catch (e) {
        toast({ title: 'Failed to load performance', status: 'error' });
      } finally {
        setLoading(false);
      }
    };
    loadPerf();
  }, [selectedId]);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Page Header */}
      <Flex justify='space-between' align='center' mb='20px'>
        <Box>
          <Text fontSize='2xl' fontWeight='bold'>
            Student Performance
          </Text>
          <Text fontSize='md' color='gray.500'>
            Analyze academic performance and results
          </Text>
        </Box>
        <Select maxW='280px' value={selectedId} onChange={(e)=>setSelectedId(e.target.value)}>
          {students.map(s => (
            <option key={s.id} value={s.id}>{s.name} ({s.class}-{s.section})</option>
          ))}
        </Select>
      </Flex>

      {/* Performance Statistics Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap='20px' mb='20px'>
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg='linear-gradient(90deg, #4481EB 0%, #04BEFE 100%)'
              icon={<MdSchool w='28px' h='28px' color='white' />}
            />
          }
          name='Average %'
          value={`${Math.round(perf.average)}%`}
        />
        
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg='linear-gradient(90deg, #01B574 0%, #51CB97 100%)'
              icon={<MdGrade w='28px' h='28px' color='white' />}
            />
          }
          name='Total Exams'
          value={String(perf.totalExams)}
          endContent={
            <Badge colorScheme='green' fontSize='sm' mt='10px'>
              Loaded
            </Badge>
          }
        />
        
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg='linear-gradient(90deg, #FFB36D 0%, #FD7853 100%)'
              icon={<MdStar w='28px' h='28px' color='white' />}
            />
          }
          name='Best Subject'
          value={perf.subjects.sort((a,b)=>b.avg-a.avg)[0]?.subject || '—'}
          endContent={
            <Badge colorScheme='purple' fontSize='sm' mt='10px'>
              {perf.subjects.length ? `${Math.round(perf.subjects.sort((a,b)=>b.avg-a.avg)[0].avg)}%` : '—'}
            </Badge>
          }
        />
        
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg='linear-gradient(90deg, #E31A1A 0%, #FF8080 100%)'
              icon={<MdTrendingUp w='28px' h='28px' color='white' />}
            />
          }
          name='Progress'
          value={loading ? 'Loading...' : 'Updated'}
        />
      </SimpleGrid>

      {/* Recent Results for selected student */}
      <Card p='20px'>
        <TableContainer>
          <Table variant='simple'>
            <Thead>
              <Tr>
                <Th>Exam</Th>
                <Th>Subject</Th>
                <Th isNumeric>Marks</Th>
                <Th>Grade</Th>
                <Th>Date</Th>
              </Tr>
            </Thead>
            <Tbody>
              {perf.recentResults.map((r, idx) => (
                <Tr key={idx}>
                  <Td>{r.title || `#${r.examId}`}</Td>
                  <Td>{r.subject}</Td>
                  <Td isNumeric>{r.marks}</Td>
                  <Td>{r.grade}</Td>
                  <Td>{r.examDate ? new Date(r.examDate).toLocaleDateString() : ''}</Td>
                </Tr>
              ))}
              {!perf.recentResults.length && (
                <Tr><Td colSpan={5}>No results</Td></Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
