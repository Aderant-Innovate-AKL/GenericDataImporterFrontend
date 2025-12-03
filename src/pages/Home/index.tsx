import { useState, useEffect, useRef } from 'react';

import { PlatformPageTitleBar } from '@aderant/stridyn-foundation';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
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

import presetsData from '../../data/presets.json';
import type { Preset } from '../../types/presets';

export default function Home() {
  const [navTab, setNavTab] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textValue, setTextValue] = useState('');
  const [tableData] = useState<Array<Record<string, string>>>([]);
  const [keyDefinitions, setKeyDefinitions] = useState<
    Array<{ keyName: string; keyDescription: string }>
  >([]);
  const [pageTitle, setPageTitle] = useState('Custom Data Importer');
  const [selectedPreset, setSelectedPreset] = useState('Custom');
  const [fileProcessingStatus, setFileProcessingStatus] = useState('');
  const filePollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const presets = presetsData.presets as Preset[];

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name);
      setSelectedFile(file);
      // Start polling for file processing status
      updateFileProcessingStatus();
    }
  };

  const updateFileProcessingStatus = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    setFileProcessingStatus(`Processing...\nLast polled at ${timeString}`);
  };

  // File processing polling effect
  useEffect(() => {
    if (selectedFile) {
      // Update immediately when file is selected
      updateFileProcessingStatus();

      // Set up interval to update every 3 seconds
      filePollingIntervalRef.current = setInterval(() => {
        updateFileProcessingStatus();
      }, 3000);
    } else {
      // Clear interval when no file is selected
      if (filePollingIntervalRef.current) {
        clearInterval(filePollingIntervalRef.current);
        filePollingIntervalRef.current = null;
      }
      setFileProcessingStatus('');
    }

    // Cleanup on unmount
    return () => {
      if (filePollingIntervalRef.current) {
        clearInterval(filePollingIntervalRef.current);
      }
    };
  }, [selectedFile]);

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
              <Box sx={{ display: 'flex', gap: 2, mb: 4, width: '100%' }}>
                {/* Document Upload Box - Left Side */}
                <Box
                  sx={{
                    flex: '0 0 25%',
                    bgcolor: 'info.main',
                    borderRadius: 2,
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    position: 'relative',
                    height: 400,
                  }}
                >
                  {/* Help Icon */}
                  <Tooltip title="Upload a file to parse." arrow>
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
                    Document Upload
                  </Typography>

                  <TextField
                    value={selectedFile?.name || ''}
                    placeholder="No file selected"
                    variant="outlined"
                    fullWidth
                    disabled
                    sx={{
                      bgcolor: 'white',
                      borderRadius: 1,
                      '& .MuiInputBase-input.Mui-disabled': {
                        WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    component="label"
                    fullWidth
                    sx={{
                      bgcolor: 'white',
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: 'grey.100',
                      },
                    }}
                  >
                    Choose File
                    <input type="file" hidden onChange={handleFileChange} />
                  </Button>

                  {/* Spacer to push content to bottom */}
                  <Box sx={{ flex: 1 }} />

                  {selectedFile && (
                    <>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          flex: 1,
                        }}
                      >
                        <CircularProgress size={80} style={{ color: 'white' }} />
                      </Box>
                      <Typography
                        variant="body2"
                        color="primary.contrastText"
                        sx={{
                          textAlign: 'center',
                          whiteSpace: 'pre-line',
                        }}
                      >
                        {fileProcessingStatus}
                      </Typography>
                    </>
                  )}
                </Box>

                {/* Table Section - Right Side */}
                <Box
                  sx={{
                    flex: '0 0 75%',
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
                  <Tooltip title="View the parsed data from the document." arrow>
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
                    Parsed Data
                  </Typography>

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
                            {keyDefinitions.map((keyDef, index) => (
                              <TableCell key={index} sx={{ fontWeight: 600 }}>
                                {keyDef.keyName || `Column ${index + 1}`}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {tableData.map((row, rowIndex) => (
                            <TableRow key={rowIndex} sx={{ height: 20 }}>
                              {keyDefinitions.map((keyDef, colIndex) => (
                                <TableCell key={colIndex}>
                                  {row[keyDef.keyName] || ''}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </div>
  );
}
