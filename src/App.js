import React, { useState, useEffect, useCallback } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import axios from 'axios';

function App() {
  const [powerOn, setPowerOn] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchPowerState = useCallback(async () => {
    try {
      const response = await axios.get(`https://api.thingspeak.com/channels/2696543/fields/4/last.json?api_key=SN138ZNN5TFZ0L8U`);
      const lastValue = response.data.field4;
      setPowerOn(lastValue === '1');
    } catch (error) {
      console.error('Error fetching power state:', error);
    }
  }, []);

  useEffect(() => {
    fetchPowerState();
    const interval = setInterval(fetchPowerState, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [fetchPowerState]);

  const handleToggle = async (event) => {
    if (isUpdating) return; // Prevent multiple rapid updates
    setIsUpdating(true);

    const newState = event.target.checked;
    
    try {
      const field4Value = newState ? 1 : 0;
      const url = `https://api.thingspeak.com/update?api_key=TZX5D3TY2PK6YAIA&field4=${field4Value}`;
      const response = await axios.get(url);
      
      if (response.data > 0) {
        console.log(`Machine power ${newState ? 'ON' : 'OFF'} request sent successfully`);
        // Wait for a short time to allow ThingSpeak to update
        setTimeout(() => {
          fetchPowerState();
          setIsUpdating(false);
        }, 5000);
      } else {
        console.error('Failed to update machine power state');
        setIsUpdating(false);
      }
    } catch (error) {
      console.error('Error occurred while sending the request:', error);
      setIsUpdating(false);
    }
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Compost Status Monitoring System
          </Typography>
          <FormControlLabel
            label={powerOn ? 'Power On' : 'Power Off'}
            control={
              <Switch
                checked={powerOn}
                onChange={handleToggle}
                name="powerSwitch"
                color="error"
                disabled={isUpdating}
              />
            }
            sx={{ ml: 'auto' }}
          />
        </Toolbar>
      </AppBar>

      {/* Main content */}
      <Container>
        <Box my={4}>
          {/* Charts */}
          <Grid container spacing={3}>
            {/* First Chart */}
            <Grid item xs={12} md={6}>
              <iframe
                width="450"
                height="260"
                style={{ border: '1px solid #cccccc' }}
                src="https://thingspeak.com/channels/2696543/charts/1?bgcolor=%23ffffff&color=%23d62020&dynamic=true&results=60&title=Ammonia+Concentration%28PPM%29&type=line"
                title="Ammonia Concentration"
              ></iframe>
            </Grid>

            {/* Second Chart */}
            <Grid item xs={12} md={6}>
              <iframe
                width="450"
                height="260"
                style={{ border: '1px solid #cccccc' }}
                src="https://thingspeak.com/channels/2696543/charts/2?bgcolor=%23ffffff&color=%23d62020&dynamic=true&results=60&title=Humidity%28%25%29&type=line"
                title="Humidity"
              ></iframe>
            </Grid>

            {/* Third Chart */}
            <Grid item xs={12} md={6}>
              <iframe
                width="450"
                height="260"
                style={{ border: '1px solid #cccccc' }}
                src="https://thingspeak.com/channels/2696543/charts/3?bgcolor=%23ffffff&color=%23d62020&dynamic=true&results=60&title=Temperature%28%C2%B0C%29&type=line"
                title="Temperature"
              ></iframe>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </div>
  );
}

export default App;