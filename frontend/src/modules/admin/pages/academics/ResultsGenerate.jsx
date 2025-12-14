import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  HStack,
  VStack,
  Button,
  ButtonGroup,
  Icon,
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  useToast,
  useColorModeValue,
  Badge,
  Tooltip,
  Divider,
} from '@chakra-ui/react';
import { MdArrowBack, MdCloudUpload, MdFileDownload, MdRefresh } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import Card from 'components/card/Card';
import useClassOptions from '../../../../hooks/useClassOptions';
import * as examsApi from '../../../../services/api/exams';
import * as resultsApi from '../../../../services/api/results';

function parseCSV(text) {
  const rows = [];
  let i = 0, field = '', row = [], inQuotes = false;
  while (i < text.length) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else {
        field += char;
      }
    } else {
      if (char === '"') { inQuotes = true; }
      else if (char === ',') { row.push(field); field = ''; }
      else if (char === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else if (char === '\r') { /* ignore */ }
      else { field += char; }
    }
    i++;
  }
  if (field.length > 0 || row.length) { row.push(field); rows.push(row); }
  return rows;
}

export default function ResultsGenerate() {
  const navigate = useNavigate();
  const toast = useToast();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.300');

  const { classOptions, sectionsByClass } = useClassOptions();
  const [cls, setCls] = useState('');
  const [section, setSection] = useState('');
  const [examId, setExamId] = useState('');
  const [subject, setSubject] = useState('');
  const [singleStudentId, setSingleStudentId] = useState('');

  const [exams, setExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(false);

  const [fileName, setFileName] = useState('');
  const [dataRows, setDataRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [uploading, setUploading] = useState(false);

  const fileRef = useRef(null);

  const requiredHeaders = ['examId','studentId','subject','marks','grade'];

  const loadExams = useCallback(async () => {
    try {
      setLoadingExams(true);
      const res = await examsApi.list({ pageSize: 200 });
      const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
      setExams(items);
    } catch (e) { console.error(e); }
    finally { setLoadingExams(false); }
  }, []);

  useEffect(() => { loadExams(); }, [loadExams]);

  const onPickFile = () => fileRef.current?.click();

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (ext !== 'csv') {
      toast({ title: 'Please upload CSV file', description: 'Excel files are supported by saving as CSV format.', status: 'warning' });
      return;
    }
    setFileName(file.name);
    const text = await file.text();
    const matrix = parseCSV(text).filter(r => r.length && r.some(c => String(c).trim() !== ''));
    if (!matrix.length) { setHeaders([]); setDataRows([]); return; }
    const hdrs = matrix[0].map(h => String(h).trim());
    const rows = matrix.slice(1).map(cols => Object.fromEntries(hdrs.map((h, idx) => [h, cols[idx] !== undefined ? String(cols[idx]).trim() : ''])));
    setHeaders(hdrs);
    setDataRows(rows);
  };

  const valid = useMemo(() => requiredHeaders.every(h => headers.includes(h)) && dataRows.length > 0, [headers, dataRows]);

  const sampleCSV = useMemo(() => {
    return 'examId,studentId,subject,marks,grade\n101,2001,Mathematics,85,A\n101,2002,Mathematics,67,B\n';
  }, []);

  const downloadTemplate = () => {
    const blob = new Blob([sampleCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'results_template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const onUpload = async () => {
    if (!valid) { toast({ title: 'CSV not valid', description: 'Make sure headers match the template.', status: 'error' }); return; }
    const items = dataRows.map(r => ({
      examId: Number(r.examId || examId) || undefined,
      studentId: r.studentId ? Number(r.studentId) : (singleStudentId ? Number(singleStudentId) : undefined),
      subject: r.subject || subject || undefined,
      marks: r.marks === '' ? null : Number(r.marks),
      grade: r.grade || null,
    })).filter(x => x.examId && x.studentId && x.subject);
    if (!items.length) { toast({ title: 'No valid rows', status: 'warning' }); return; }
    try {
      setUploading(true);
      await resultsApi.bulkCreate(items);
      toast({ title: `Uploaded ${items.length} result(s)`, status: 'success' });
      setDataRows([]); setHeaders([]); setFileName('');
      // Optionally navigate back
      navigate('/admin/academics/results');
    } catch (e) {
      console.error(e);
      toast({ title: 'Upload failed', status: 'error' });
    } finally { setUploading(false); }
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justifyContent="space-between" alignItems="center">
        <HStack>
          <Button leftIcon={<Icon as={MdArrowBack} />} onClick={()=> navigate(-1)} variant='outline'>Back</Button>
          <Box>
            <Heading as='h3' size='lg' mb={1} color={textColor}>Generate Results</Heading>
            <Text color={textColorSecondary}>Filter and upload a CSV file to add results in bulk</Text>
          </Box>
        </HStack>
        <ButtonGroup>
          <Button leftIcon={<Icon as={MdFileDownload} />} variant='outline' colorScheme='blue' onClick={downloadTemplate}>Download Template</Button>
          <Button leftIcon={<Icon as={MdRefresh} />} variant='outline' onClick={()=>{ setCls(''); setSection(''); setExamId(''); setSubject(''); setDataRows([]); setHeaders([]); setFileName(''); }}>Reset</Button>
        </ButtonGroup>
      </Flex>

      <Card p={4} mb={5}>
        <HStack spacing={3} flexWrap='wrap' rowGap={3}>
          <Select placeholder='Class' value={cls} onChange={(e)=>{ setCls(e.target.value); setSection(''); }} w='160px' size='sm'>
            {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Select placeholder='Section' value={section} onChange={(e)=> setSection(e.target.value)} w='140px' size='sm' isDisabled={!cls}>
            {(sectionsByClass[cls] || []).map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Select placeholder='Exam' value={examId} onChange={(e)=> setExamId(e.target.value)} w='220px' size='sm' isLoading={loadingExams}>
            {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.title || `Exam #${ex.id}`}</option>)}
          </Select>
          <Input placeholder='Subject (optional)' value={subject} onChange={(e)=> setSubject(e.target.value)} w='220px' size='sm' />
          <Input placeholder='Student ID (optional)' value={singleStudentId} onChange={(e)=> setSingleStudentId(e.target.value.replace(/[^0-9]/g,''))} w='200px' size='sm' />
          <Button leftIcon={<Icon as={MdCloudUpload} />} onClick={onPickFile} colorScheme='blue' size='sm'>Upload CSV</Button>
          <input ref={fileRef} type='file' accept='.csv' style={{ display: 'none' }} onChange={onFileChange} />
          {fileName ? <Badge colorScheme='purple' variant='subtle'>{fileName}</Badge> : null}
        </HStack>
        <Divider my={4} borderColor={borderColor} />
        <VStack align='stretch' spacing={2}>
          <Text fontWeight='600'>Expected CSV schema</Text>
          <Box borderWidth='1px' borderColor={borderColor} borderRadius='8px' p={3} bg={useColorModeValue('gray.50','whiteAlpha.100')}>
            <Text fontFamily='mono' fontSize='sm'>examId, studentId, subject, marks, grade</Text>
            <Text fontFamily='mono' fontSize='sm'>101, 2001, Mathematics, 85, A</Text>
            <Text fontFamily='mono' fontSize='sm'>101, 2002, Mathematics, 67, B</Text>
            <Text mt={2} color={textColorSecondary}>Note: You can leave marks or grade blank. Save Excel as CSV before uploading.</Text>
          </Box>
        </VStack>
      </Card>

      <Card p={0} overflow='hidden'>
        <Heading size='sm' p={4} borderBottomWidth='1px' borderColor={borderColor}>Preview</Heading>
        <Box overflowX='auto'>
          <Table size='sm' variant='simple'>
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                {headers.length ? headers.map(h => <Th key={h}>{h}</Th>) : <Th>No data</Th>}
              </Tr>
            </Thead>
            <Tbody>
              {dataRows.slice(0,50).map((r, idx) => (
                <Tr key={idx}>
                  {headers.map(h => <Td key={h}>{r[h]}</Td>)}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
        <Flex justify='space-between' align='center' p={4} borderTopWidth='1px' borderColor={borderColor}>
          <Text color={textColorSecondary}>{dataRows.length ? `${dataRows.length} row(s) parsed` : 'Upload a CSV to preview rows'}</Text>
          <Tooltip label={!valid ? 'Upload a valid CSV with required headers' : ''}>
            <Button colorScheme='blue' onClick={onUpload} isDisabled={!valid || uploading} isLoading={uploading}>Create Results</Button>
          </Tooltip>
        </Flex>
      </Card>
    </Box>
  );
}
