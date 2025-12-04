import { useState, useMemo, useRef } from 'react';

import { PlatformPageTitleBar } from '@aderant/stridyn-foundation';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { ImportWorkflow } from 'src/gdi-component-lib';
import type {
  ExtractionContext,
  ExtractionResult,
  FieldMappings,
  FinalOutput,
} from 'src/gdi-component-lib';
import { buildFinalOutput } from 'src/gdi-component-lib/state/finalOutput';

import presetsData from '../../data/presets.json';
import type { Preset } from '../../types/presets';

export default function Home() {
  const [navTab, setNavTab] = useState(0);
  const [textValue, setTextValue] = useState('');
  const [keyDefinitions, setKeyDefinitions] = useState<
    Array<{ keyName: string; keyDescription: string }>
  >([]);
  const [pageTitle, setPageTitle] = useState('Custom Data Importer');
  const [selectedPreset, setSelectedPreset] = useState('Custom');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [finalOutput, setFinalOutput] = useState<FinalOutput | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedRows, setUploadedRows] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const presets = presetsData.presets as Preset[];

  // Convert keyDefinitions to ExtractionContext
  const extractionContext = useMemo<ExtractionContext>(
    () => ({
      description: textValue || 'Extract data from file',
      fields: keyDefinitions.map((kd) => ({
        field: kd.keyName || 'unnamed_field',
        description: kd.keyDescription || '',
        required: false,
      })),
    }),
    [textValue, keyDefinitions],
  );

  const handlePresetClick = (presetName: string) => {
    setPageTitle(`${presetName} Data Importer`);
    setSelectedPreset(presetName);

    // Find the preset data
    const preset = presets.find((p) => p.name === presetName);

    if (preset) {
      setTextValue(preset.businessContext);
      setKeyDefinitions(preset.keyDefinitions);
    }
  };

  const handleAddKeyRow = () => {
    setKeyDefinitions([...keyDefinitions, { keyName: '', keyDescription: '' }]);
  };

  const handleKeyChange = (
    index: number,
    field: 'keyName' | 'keyDescription',
    value: string,
  ) => {
    const updatedKeys = [...keyDefinitions];
    updatedKeys[index][field] = value;
    setKeyDefinitions(updatedKeys);
  };

  const handleRemoveKeyRow = (index: number) => {
    const updatedKeys = keyDefinitions.filter((_, i) => i !== index);
    setKeyDefinitions(updatedKeys);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportDialogOpen(true);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportSuccess = (
    result: ExtractionResult,
    mappings?: FieldMappings,
    compoundOverrides?: Record<
      number,
      Record<string, Record<string, string | number | null>>
    >,
  ) => {
    if (mappings) {
      const output = buildFinalOutput(result, mappings, compoundOverrides);
      setFinalOutput(output);
    }
    setImportDialogOpen(false);
    setSelectedFile(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImportClose = () => {
    setImportDialogOpen(false);
    setSelectedFile(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearResults = () => {
    setFinalOutput(null);
    setUploadedCount(0);
    setUploadProgress(0);
    setIsUploading(false);
    setUploadedRows(new Set());
  };

  const handleUploadClick = async () => {
    if (!finalOutput || finalOutput.items.length === 0 || isUploading) {
      return;
    }

    setIsUploading(true);
    setUploadedCount(0);
    setUploadProgress(0);
    setUploadedRows(new Set());

    const totalRows = finalOutput.items.length;

    for (let i = 0; i < totalRows; i++) {
      // Random duration between 0.1 and 0.6 seconds
      const duration = Math.random() * 500 + 100; // 100ms to 600ms
      const startTime = Date.now();

      // Animate progress from 0 to 100
      const animateProgress = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);
        setUploadProgress(progress);

        if (progress < 100) {
          requestAnimationFrame(animateProgress);
        } else {
          // Row completed
          setUploadedCount(i + 1);
          setUploadedRows((prev) => new Set(prev).add(i));
          setUploadProgress(0);
        }
      };

      // Start animation
      animateProgress();

      // Wait for the duration
      await new Promise((resolve) => setTimeout(resolve, duration));
    }

    setIsUploading(false);
    setUploadProgress(0);
  };

  return (
    <div data-testid="home-page">
      <PlatformPageTitleBar title={pageTitle} />
      <Box
        sx={{
          maxWidth: 1200,
          mx: 'auto',
          p: 4,
        }}
        data-testid="home-page-container"
      >
        {/* Navigation Examples Section */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            {/* Tabs with Presets */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
              }}
            >
              <Tabs value={navTab} onChange={(_, val) => setNavTab(val)}>
                <Tab label="Config" />
                <Tab label="Mock App" />
                <Tab label="Upload To Stridyn" />
              </Tabs>

              {/* Presets Section */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Presets:
                </Typography>
                {presets.map((preset) => (
                  <Button
                    key={preset.id}
                    variant={selectedPreset === preset.name ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => handlePresetClick(preset.name)}
                  >
                    {preset.name}
                  </Button>
                ))}
              </Box>
            </Box>

            {/* Parser Tab Content */}
            {navTab === 0 && (
              <Box sx={{ display: 'flex', gap: 2, mb: 4, width: '100%' }}>
                {/* Left Column - Keys Box */}
                <Box
                  sx={{
                    flex: '0 0 25%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    height: 400,
                  }}
                >
                  {/* Keys Box */}
                  <Box
                    sx={{
                      flex: 1,
                      bgcolor: 'info.main',
                      borderRadius: 2,
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      position: 'relative',
                    }}
                  >
                    {/* Help Icon */}
                    <Tooltip
                      title="Enter some business context to aid the AI parser in interpreting the input data."
                      arrow
                    >
                      <IconButton
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          color: 'white',
                        }}
                        size="small"
                      >
                        <HelpOutlineIcon />
                      </IconButton>
                    </Tooltip>

                    <Typography
                      variant="h6"
                      color="primary.contrastText"
                      sx={{ textAlign: 'center' }}
                    >
                      Business Context
                    </Typography>

                    {/* TextField and Confirm Button */}
                    <TextField
                      value={textValue}
                      onChange={(e) => setTextValue(e.target.value)}
                      placeholder="Enter text"
                      variant="outlined"
                      multiline
                      fullWidth
                      sx={{
                        flex: 1,
                        bgcolor: 'white',
                        borderRadius: 1,
                        '& .MuiInputBase-root': {
                          height: '100%',
                          alignItems: 'flex-start',
                        },
                      }}
                    />
                  </Box>
                </Box>

                {/* Square Box */}
                <Box
                  sx={{
                    flex: '1 1 auto',
                    height: 400,
                    bgcolor: 'info.main',
                    borderRadius: 2,
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    gap: 2,
                  }}
                >
                  {/* Help Icon */}
                  <Tooltip
                    title="Enter the labels and descriptions of the information to find."
                    arrow
                  >
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        color: 'white',
                      }}
                      size="small"
                    >
                      <HelpOutlineIcon />
                    </IconButton>
                  </Tooltip>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                    }}
                  >
                    <Typography variant="h6" color="secondary.contrastText">
                      Key Definitions
                    </Typography>
                  </Box>

                  {/* Table for Key Definitions */}
                  <Box
                    sx={{
                      flex: 1,
                      borderRadius: 0,
                      overflow: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <TableContainer sx={{ flex: 1 }}>
                      <Table size="small" sx={{ bgcolor: 'white', height: '100%' }}>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, width: '25%' }}>
                              Key Name
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, width: '75%' }}>
                              Key Description
                            </TableCell>
                            <TableCell sx={{ width: 50 }}></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {keyDefinitions.map((row, index) => (
                            <TableRow key={index} sx={{ height: 20 }}>
                              <TableCell>
                                <TextField
                                  value={row.keyName}
                                  onChange={(e) =>
                                    handleKeyChange(index, 'keyName', e.target.value)
                                  }
                                  placeholder="Enter key name"
                                  variant="standard"
                                  fullWidth
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  value={row.keyDescription}
                                  onChange={(e) =>
                                    handleKeyChange(
                                      index,
                                      'keyDescription',
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Enter key description"
                                  variant="standard"
                                  fullWidth
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <IconButton
                                  size="small"
                                  onClick={() => handleRemoveKeyRow(index)}
                                  sx={{ color: 'error.main' }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>

                  {/* Add Row Button */}
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddKeyRow}
                    sx={{
                      bgcolor: 'white',
                      color: 'secondary.main',
                      '&:hover': {
                        bgcolor: 'grey.100',
                      },
                    }}
                  >
                    Add Row
                  </Button>
                </Box>
              </Box>
            )}

            {/* Mock App Tab Content */}
            {navTab === 1 && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  mb: 4,
                  width: '100%',
                }}
              >
                {/* Import Workflow Section */}
                {!finalOutput && (
                  <Box
                    sx={{
                      bgcolor: 'info.main',
                      borderRadius: 2,
                      p: 4,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2,
                      minHeight: 400,
                    }}
                  >
                    <UploadFileIcon
                      sx={{ fontSize: 80, color: 'primary.contrastText' }}
                    />
                    <Typography
                      variant="h5"
                      color="primary.contrastText"
                      sx={{ textAlign: 'center' }}
                    >
                      Upload a File to Extract Data
                    </Typography>
                    <Typography
                      variant="body1"
                      color="primary.contrastText"
                      sx={{ textAlign: 'center', maxWidth: 600 }}
                    >
                      Click the button below to select a file (CSV or Excel). The AI will
                      extract the fields defined in the Config tab based on your business
                      context.
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<UploadFileIcon />}
                      onClick={handleImportClick}
                      disabled={keyDefinitions.length === 0}
                      sx={{
                        bgcolor: 'white',
                        color: 'primary.main',
                        px: 4,
                        py: 1.5,
                        '&:hover': {
                          bgcolor: 'grey.100',
                        },
                        '&:disabled': {
                          bgcolor: 'grey.300',
                        },
                      }}
                    >
                      Select File
                    </Button>
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      // accept=".csv,.xlsx,.xls"
                      // accept all files
                      accept="*"
                      style={{ display: 'none' }}
                      onChange={handleFileSelect}
                    />
                    {keyDefinitions.length === 0 && (
                      <Typography
                        variant="caption"
                        color="error.light"
                        sx={{ textAlign: 'center' }}
                      >
                        Please add at least one field definition in the Config tab
                      </Typography>
                    )}
                  </Box>
                )}

                {/* Results Display */}
                {finalOutput && (
                  <Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6">
                        Import Results ({finalOutput.items.length} rows)
                      </Typography>
                      <Button variant="outlined" onClick={handleClearResults}>
                        Clear & Import Another
                      </Button>
                    </Box>
                    <TableContainer
                      sx={{
                        maxHeight: 600,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                      }}
                    >
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow>
                            {finalOutput.items.length > 0 &&
                              Object.keys(finalOutput.items[0]).map((field) => (
                                <TableCell
                                  key={field}
                                  sx={{ fontWeight: 'bold', bgcolor: 'primary.lighter' }}
                                >
                                  {field}
                                </TableCell>
                              ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {finalOutput.items.map((item, idx) => (
                            <TableRow key={idx} hover>
                              {Object.values(item).map((value, colIdx) => (
                                <TableCell key={colIdx}>{String(value ?? '')}</TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {/* Import Workflow Dialog */}
                <ImportWorkflow
                  open={importDialogOpen}
                  file={selectedFile || undefined}
                  context={extractionContext}
                  apiConfig={{
                    baseUrl: import.meta.env.UI_API_BASE_URL || 'http://localhost:8000',
                  }}
                  title={`${pageTitle} - Import File`}
                  onClose={handleImportClose}
                  onSuccess={handleImportSuccess}
                />
              </Box>
            )}

            {/* Upload To Stridyn Tab Content */}
            {navTab === 2 && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  mb: 4,
                  width: '100%',
                }}
              >
                <Box
                  sx={{
                    bgcolor: 'info.main',
                    borderRadius: 2,
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    minHeight: 400,
                  }}
                >
                  {/* Upload Button and Progress Bar */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      width: '100%',
                    }}
                  >
                    <Button
                      variant="contained"
                      onClick={handleUploadClick}
                      disabled={
                        !finalOutput || finalOutput.items.length === 0 || isUploading
                      }
                      sx={{
                        bgcolor: 'white',
                        color: 'primary.main',
                        '&:hover': {
                          bgcolor: 'grey.100',
                        },
                        '&:disabled': {
                          bgcolor: 'grey.300',
                          color: 'grey.600',
                        },
                      }}
                    >
                      Upload
                    </Button>
                    <Typography
                      variant="body1"
                      color="primary.contrastText"
                      sx={{ fontWeight: 600, minWidth: 'fit-content' }}
                    >
                      {uploadedCount}/{finalOutput?.items.length || 0}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={uploadProgress}
                      sx={{
                        flex: 1,
                        height: 8,
                        borderRadius: 1,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: 'success.main',
                        },
                      }}
                    />
                  </Box>

                  {/* Table Section */}
                  {finalOutput && finalOutput.items.length > 0 ? (
                    <TableContainer
                      sx={{
                        maxHeight: 400,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        bgcolor: 'white',
                      }}
                    >
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell
                              sx={{ fontWeight: 'bold', bgcolor: 'primary.lighter' }}
                            >
                              Upload Status
                            </TableCell>
                            {Object.keys(finalOutput.items[0]).map((field) => (
                              <TableCell
                                key={field}
                                sx={{ fontWeight: 'bold', bgcolor: 'primary.lighter' }}
                              >
                                {field}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {finalOutput.items.map((item, idx) => (
                            <TableRow key={idx} hover>
                              <TableCell>
                                {uploadedRows.has(idx) ? (
                                  <CheckCircleIcon sx={{ color: 'success.main' }} />
                                ) : (
                                  'Pending'
                                )}
                              </TableCell>
                              {Object.values(item).map((value, colIdx) => (
                                <TableCell key={colIdx}>{String(value ?? '')}</TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                        flex: 1,
                      }}
                    >
                      <Typography
                        variant="h5"
                        color="primary.contrastText"
                        sx={{ textAlign: 'center' }}
                      >
                        Upload To Stridyn
                      </Typography>
                      <Typography
                        variant="body1"
                        color="primary.contrastText"
                        sx={{ textAlign: 'center', maxWidth: 600 }}
                      >
                        Import and parse data in the Mock App tab first to see the upload
                        table.
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </div>
  );
}
