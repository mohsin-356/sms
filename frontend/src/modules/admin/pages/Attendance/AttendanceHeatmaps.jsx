import React, { useMemo, useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Badge,
  useColorModeValue,
  HStack,
  Button,
  ButtonGroup,
  Select,
  Input,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from '@chakra-ui/react';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
import { MdWhatshot, MdCalendarToday, MdThumbUp, MdFileDownload, MdPictureAsPdf, MdRefresh } from 'react-icons/md';

const days = ['Mon','Tue','Wed','Thu','Fri','Sat'];
const periods = Array.from({ length: 8 }, (_, i) => `P${i+1}`);

const heat = [
  [95, 92, 88, 90, 93, 80, 0, 0],
  [94, 90, 89, 91, 92, 78, 0, 0],
  [93, 89, 90, 92, 91, 76, 0, 0],
  [96, 94, 92, 95, 93, 82, 0, 0],
  [97, 95, 94, 96, 94, 84, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

export default function AttendanceHeatmaps() {
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const disabledColor = useColorModeValue('#EDF2F7', '#2D3748');

  const [cls, setCls] = useState('All');
  const [section, setSection] = useState('All');
  const [week, setWeek] = useState('');
  const [heatMap, setHeatMap] = useState(heat);
  const [cell, setCell] = useState({ open: false, dayIndex: 0, periodIndex: 0, value: 0 });

  const getColor = (val) => {
    if (val === 0) return disabledColor;
    if (val >= 95) return '#38A169';
    if (val >= 90) return '#D69E2E';
    return '#E53E3E';
  };

  const peak = useMemo(() => {
    let max = -1, di = 0, pj = 0;
    heatMap.forEach((row, i) => row.forEach((v, j) => { if (v > max) { max = v; di = i; pj = j; } }));
    return { day: days[di], period: periods[pj], rate: max > -1 ? max : 0 };
  }, [heatMap]);

  const best = useMemo(() => {
    let max = -1, di = 0;
    heatMap.forEach((row, i) => row.forEach((v) => { if (v > max) { max = v; di = i; } }));
    return { day: days[di], rate: max > -1 ? max : 0 };
  }, [heatMap]);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Attendance Heatmaps</Heading>
          <Text color={textColorSecondary}>Visualize attendance concentration by day and period</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdRefresh />} variant="outline" onClick={()=>window.location.reload()}>Refresh</Button>
          <Button leftIcon={<MdFileDownload />} variant="outline" colorScheme="blue">Export CSV</Button>
          <Button leftIcon={<MdPictureAsPdf />} colorScheme="blue">Export PDF</Button>
        </ButtonGroup>
      </Flex>

      {/* KPIs */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={5}>
        <MiniStatistics
          name="Peak Attendance"
          value={`${peak.rate}% (${peak.day} - ${peak.period})`}
          startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#00b09b 0%,#96c93d 100%)' icon={<MdWhatshot size={28} color='white' />} />}
        />
        <MiniStatistics
          name="Best Day"
          value={`${best.day} (${best.rate}%)`}
          startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#667eea 0%,#764ba2 100%)' icon={<MdThumbUp size={28} color='white' />} />}
        />
        <MiniStatistics
          name="School Days"
          value={'Mon-Fri'}
          startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#00c6ff 0%,#0072ff 100%)' icon={<MdCalendarToday size={28} color='white' />} />}
        />
      </SimpleGrid>

      <Card mb={5}>
        <Flex p={4} justify="space-between" align="center" direction={{ base: 'column', md: 'row' }} gap={4}>
          <HStack>
            <Select w="180px" value={cls} onChange={(e)=>setCls(e.target.value)}>
              <option>All</option>
              <option>Class 1</option>
              <option>Class 2</option>
              <option>Class 3</option>
            </Select>
            <Select w="120px" value={section} onChange={(e)=>setSection(e.target.value)}>
              <option>All</option>
              <option>A</option>
              <option>B</option>
            </Select>
            <Input type="date" value={week} onChange={(e)=>setWeek(e.target.value)} w="180px" />
          </HStack>
        </Flex>
      </Card>

      {/* Heatmap */}
      <Card p={4}>
        <Box overflowX='auto' w='100%'>
          <Box display='grid' gridTemplateColumns={`repeat(${periods.length + 1}, minmax(80px, 1fr))`} gap={2}>
            <Box />
            {periods.map((p) => (
              <Box key={p} textAlign='center' fontWeight='600' whiteSpace='nowrap'>{p}</Box>
            ))}
            {days.map((d, i) => (
              <React.Fragment key={d}>
                <Box fontWeight='600' whiteSpace='nowrap'>{d}</Box>
                {heatMap[i].map((v, j) => (
                  <Tooltip key={`t-${i}-${j}`} label={`${d} ${periods[j]}: ${v || '-'}%`}>
                    <Box
                      key={`${i}-${j}`}
                      h={{ base: '36px', md: '40px' }}
                      borderRadius='md'
                      bg={getColor(v)}
                      display='flex'
                      alignItems='center'
                      justifyContent='center'
                      color='white'
                      fontWeight='700'
                      cursor={v === 0 ? 'not-allowed' : 'pointer'}
                      onClick={()=> v !== 0 && setCell({ open: true, dayIndex: i, periodIndex: j, value: v })}
                    >
                      {v ? `${v}%` : '-'}
                    </Box>
                  </Tooltip>
                ))}
              </React.Fragment>
            ))}
          </Box>
        </Box>
        <Flex mt={4} gap={4} align='center'>
          <Text fontSize='sm' color={textColorSecondary}>Legend:</Text>
          <Badge colorScheme='green'>{'>=95%'}</Badge>
          <Badge colorScheme='yellow'>90-94%</Badge>
          <Badge colorScheme='red'>{'< 90%'}</Badge>
        </Flex>
      </Card>

      <Modal isOpen={cell.open} onClose={()=>setCell((c)=>({ ...c, open:false }))} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{days[cell.dayIndex]} — {periods[cell.periodIndex]}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={2} color={textColorSecondary}>Edit attendance for this slot</Text>
            <HStack>
              <Slider value={cell.value} min={50} max={100} step={1} onChange={(v)=>setCell((c)=>({ ...c, value:v }))}>
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <Badge>{cell.value}%</Badge>
            </HStack>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={()=>setCell((c)=>({ ...c, open:false }))}>Close</Button>
            <Button colorScheme='blue' onClick={()=>{
              setHeatMap((m)=>{
                const next = m.map((row)=>row.slice());
                next[cell.dayIndex][cell.periodIndex] = cell.value;
                return next;
              });
              setCell((c)=>({ ...c, open:false }));
            }}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
