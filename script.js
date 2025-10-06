class DecibelMeter {
    constructor() {
        this.currentValue = 0;
        this.maxValue = 0;
        this.startTime = Date.now();
        this.pollingInterval = null;
        this.isPolling = false;
        this.loggingEnabled = true;
        this.logs = [];
        this.lastElapsedTimeUpdate = 0;
        
        // Trailing graph data
        this.graphData = [];
        this.maxGraphPoints = 60; // Show last 60 data points
        
        // DOM elements
        this.gaugeValue = document.getElementById('gaugeValue');
        this.gaugeFill = document.getElementById('gaugeFill');
        this.maxValueEl = document.getElementById('maxValue');
        this.elapsedTimeEl = document.getElementById('elapsedTime');
        this.trailingGraph = document.getElementById('trailingGraph');
        this.trailingGraphValue = document.getElementById('trailingGraphValue');
        this.trailingGraphCanvas = document.getElementById('trailingGraphCanvas');
        this.trailingGraphCtx = this.trailingGraphCanvas ? this.trailingGraphCanvas.getContext('2d') : null;
        this.settingsPanel = document.getElementById('settingsPanel');
        this.settingsToggle = document.getElementById('settingsToggle');
        this.closeSettings = document.getElementById('closeSettings');
        this.container = document.querySelector('.container');
        
        // Settings elements
        this.pollingUrlInput = document.getElementById('pollingUrl');
        this.autoPollingInput = document.getElementById('autoPolling');
        this.pollingIntervalInput = document.getElementById('pollingInterval');
        this.jsonPathInput = document.getElementById('jsonPath');
        this.maxJsonPathInput = document.getElementById('maxJsonPath');
        this.elapsedJsonPathInput = document.getElementById('elapsedJsonPath');
        this.enableLoggingInput = document.getElementById('enableLogging');
        this.gaugeColorInput = document.getElementById('gaugeColor');
        this.gaugeColorHexInput = document.getElementById('gaugeColorHex');
        this.canvasColorInput = document.getElementById('canvasColor');
        this.canvasColorHexInput = document.getElementById('canvasColorHex');
        this.backgroundColorInput = document.getElementById('backgroundColor');
        this.backgroundColorHexInput = document.getElementById('backgroundColorHex');
        this.textColorInput = document.getElementById('textColor');
        this.textColorHexInput = document.getElementById('textColorHex');
        this.infoPanelColorInput = document.getElementById('infoPanelColor');
        this.infoPanelColorHexInput = document.getElementById('infoPanelColorHex');
        this.gaugeGlowColorInput = document.getElementById('gaugeGlowColor');
        this.gaugeGlowColorHexInput = document.getElementById('gaugeGlowColorHex');
        this.gaugeGlowIntensityInput = document.getElementById('gaugeGlowIntensity');
        this.gaugeGlowIntensityValue = document.getElementById('gaugeGlowIntensityValue');
        this.transparentModeInput = document.getElementById('transparentMode');
        this.gaugeDesignSelect = document.getElementById('gaugeDesign');
        this.trailingGraphToggle = document.getElementById('trailingGraphToggle');
        this.containerWidthInput = document.getElementById('containerWidth');
        this.containerHeightInput = document.getElementById('containerHeight');
        this.showSettingsInput = document.getElementById('showSettings');
        
        // Logging elements
        this.loggingContent = document.getElementById('loggingContent');
        this.clearLogsBtn = document.getElementById('clearLogs');
        this.resetSettingsBtn = document.getElementById('resetSettings');
        
        // JSON Preview elements
        this.jsonPreviewModal = document.getElementById('jsonPreviewModal');
        this.jsonStatus = document.getElementById('jsonStatus');
        this.jsonContent = document.getElementById('jsonContent');
        this.closeJsonPreview = document.getElementById('closeJsonPreview');
        this.testPollingBtn = document.getElementById('testPolling');
        this.showJsonPreviewBtn = document.getElementById('showJsonPreview');
        this.keyboardHint = document.getElementById('keyboardHint');
        
        // Set initial elapsed time display
        this.elapsedTimeEl.textContent = "00:00.0";
        
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.initializeCanvas();
        this.startPolling();
        this.log('Application initialized', 'info');
    }
    
    setupEventListeners() {
        // Settings panel toggle
        this.settingsToggle.addEventListener('click', () => {
            this.settingsPanel.classList.toggle('open');
        });
        
        this.closeSettings.addEventListener('click', () => {
            this.settingsPanel.classList.remove('open');
        });
        
        // Settings changes
        this.pollingUrlInput.addEventListener('change', () => {
            this.stopPolling();
            this.startPolling();
        });
        
        this.autoPollingInput.addEventListener('change', () => {
            if (this.autoPollingInput.checked) {
                this.startPolling();
            } else {
                this.stopPolling();
            }
        });
        
        this.pollingIntervalInput.addEventListener('change', () => {
            if (this.autoPollingInput.checked) {
                this.stopPolling();
                this.startPolling();
            }
        });
        
        this.gaugeColorInput.addEventListener('change', () => {
            this.updateGaugeColor();
            this.syncHexInput('gaugeColor', 'gaugeColorHex');
        });
        
        this.gaugeColorHexInput.addEventListener('input', () => {
            this.syncColorInput('gaugeColorHex', 'gaugeColor');
        });
        
        this.canvasColorInput.addEventListener('change', () => {
            this.updateCanvasColor();
            this.syncHexInput('canvasColor', 'canvasColorHex');
        });
        
        this.canvasColorHexInput.addEventListener('input', () => {
            this.syncColorInput('canvasColorHex', 'canvasColor');
        });
        
        this.backgroundColorInput.addEventListener('change', () => {
            this.updateBackgroundColor();
            this.syncHexInput('backgroundColor', 'backgroundColorHex');
        });
        
        this.backgroundColorHexInput.addEventListener('input', () => {
            this.syncColorInput('backgroundColorHex', 'backgroundColor');
        });
        
        this.textColorInput.addEventListener('change', () => {
            this.updateTextColor();
            this.syncHexInput('textColor', 'textColorHex');
        });
        
        this.textColorHexInput.addEventListener('input', () => {
            this.syncColorInput('textColorHex', 'textColor');
        });
        
        this.infoPanelColorInput.addEventListener('change', () => {
            this.updateInfoPanelColor();
            this.syncHexInput('infoPanelColor', 'infoPanelColorHex');
        });
        
        this.infoPanelColorHexInput.addEventListener('input', () => {
            this.syncColorInput('infoPanelColorHex', 'infoPanelColor');
        });
        
        this.gaugeGlowColorInput.addEventListener('change', () => {
            this.updateGaugeGlow();
            this.syncHexInput('gaugeGlowColor', 'gaugeGlowColorHex');
        });
        
        this.gaugeGlowColorHexInput.addEventListener('input', () => {
            this.syncColorInput('gaugeGlowColorHex', 'gaugeGlowColor');
        });
        
        this.gaugeGlowIntensityInput.addEventListener('input', () => {
            this.updateGaugeGlow();
        });
        
        this.transparentModeInput.addEventListener('change', () => {
            this.toggleTransparentMode();
        });
        
        this.gaugeDesignSelect.addEventListener('change', () => {
            this.updateGaugeDesign();
        });
        
        this.trailingGraphToggle.addEventListener('change', () => {
            this.toggleTrailingGraph();
        });
        
        this.containerWidthInput.addEventListener('input', () => {
            this.updateContainerSize();
        });
        
        this.containerHeightInput.addEventListener('input', () => {
            this.updateContainerSize();
        });
        
        this.enableLoggingInput.addEventListener('change', () => {
            this.toggleLogging();
        });
        
        this.clearLogsBtn.addEventListener('click', () => {
            this.clearLogs();
        });
        
        this.resetSettingsBtn.addEventListener('click', () => {
            this.resetSettings();
        });
        
        this.showSettingsInput.addEventListener('change', () => {
            this.toggleSettingsButton();
        });
        
        // JSON Preview functionality
        this.testPollingBtn.addEventListener('click', () => {
            this.testPolling();
        });
        
        this.showJsonPreviewBtn.addEventListener('click', () => {
            this.showJsonPreview();
        });
        
        this.closeJsonPreview.addEventListener('click', () => {
            this.hideJsonPreview();
        });
        
        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.settingsPanel.contains(e.target) && 
                !this.settingsToggle.contains(e.target) && 
                this.settingsPanel.classList.contains('open')) {
                this.settingsPanel.classList.remove('open');
            }
            
            if (e.target === this.jsonPreviewModal) {
                this.hideJsonPreview();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Open/close settings with 's' key
            if (e.key.toLowerCase() === 's' && !e.ctrlKey && !e.altKey && !e.metaKey) {
                // Only trigger if not typing in an input field
                const activeElement = document.activeElement;
                const isInputFocused = activeElement && (
                    activeElement.tagName === 'INPUT' || 
                    activeElement.tagName === 'TEXTAREA' || 
                    activeElement.contentEditable === 'true'
                );
                
                if (!isInputFocused) {
                    e.preventDefault();
                    this.settingsPanel.classList.toggle('open');
                }
            }
            
            // Close settings with Escape key
            if (e.key === 'Escape') {
                if (this.settingsPanel.classList.contains('open')) {
                    this.settingsPanel.classList.remove('open');
                }
                if (this.jsonPreviewModal.classList.contains('show')) {
                    this.hideJsonPreview();
                }
            }
            
            // Force reset settings with Ctrl+R
            if (e.key.toLowerCase() === 'r' && e.ctrlKey) {
                e.preventDefault();
                this.resetSettings();
                this.log('Settings reset via keyboard shortcut', 'info');
            }
        });
    }
    
    log(message, type = 'info') {
        if (!this.loggingEnabled) return;
        
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = {
            timestamp,
            message,
            type
        };
        
        this.logs.push(logEntry);
        
        // Keep only last 50 logs
        if (this.logs.length > 50) {
            this.logs.shift();
        }
        
        this.updateLogDisplay();
    }
    
    updateLogDisplay() {
        if (!this.loggingEnabled) return;
        
        this.loggingContent.innerHTML = '';
        this.logs.slice(-20).forEach(log => {
            const logElement = document.createElement('div');
            logElement.className = `log-entry ${log.type}`;
            logElement.textContent = `[${log.timestamp}] ${log.message}`;
            this.loggingContent.appendChild(logElement);
        });
        
        // Auto-scroll to bottom
        this.loggingContent.scrollTop = this.loggingContent.scrollHeight;
    }
    
    clearLogs() {
        this.logs = [];
        this.loggingContent.innerHTML = '<div class="log-entry">Logs cleared</div>';
        this.log('Logs cleared', 'info');
    }
    
    resetSettings() {
        // Clear localStorage
        localStorage.removeItem('decibelMeterSettings');
        
        // Reset to default values
        this.pollingUrlInput.value = 'http://localhost:3000/proxy/meter/livedata';
        this.autoPollingInput.checked = true;
        this.pollingIntervalInput.value = 100;
        this.jsonPathInput.value = 'Channels.0.Level';
        this.maxJsonPathInput.value = 'Channels.0.Max';
        this.elapsedJsonPathInput.value = 'Channels.0.Elapsed Time';
        this.enableLoggingInput.checked = true;
        this.gaugeColorInput.value = '#00ff88';
        this.canvasColorInput.value = '#000000';
        this.backgroundColorInput.value = '#1a1a2e';
        this.textColorInput.value = '#ffffff';
        this.infoPanelColorInput.value = '#2a2a3e';
        this.gaugeGlowColorInput.value = '#00d4ff';
        this.gaugeGlowIntensityInput.value = 20;
        this.transparentModeInput.checked = false;
        this.gaugeDesignSelect.value = 'liquid-glass';
        this.trailingGraphToggle.checked = false;
        this.containerWidthInput.value = 400;
        this.containerHeightInput.value = 500;
        this.showSettingsInput.checked = true;
        
        // Apply the reset settings
        this.updateGaugeColor();
        this.updateCanvasColor();
        this.updateBackgroundColor();
        this.updateTextColor();
        this.updateInfoPanelColor();
        this.updateGaugeGlow();
        this.toggleTransparentMode();
        this.updateGaugeDesign();
        this.toggleTrailingGraph();
        this.updateContainerSize();
        this.toggleSettingsButton();
        this.toggleLogging();
        
        this.log('Settings reset to defaults', 'info');
    }
    
    toggleLogging() {
        this.loggingEnabled = this.enableLoggingInput.checked;
        if (this.loggingEnabled) {
            this.log('Logging enabled', 'info');
        } else {
            this.log('Logging disabled', 'warning');
        }
    }
    
    
    async fetchDecibelData() {
        try {
            const url = this.pollingUrlInput.value;
            this.log(`Fetching data from: ${url}`, 'info');
            
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }
            
            const data = await response.json();
            this.log(`Data received: ${JSON.stringify(data)}`, 'success');
            return data;
        } catch (error) {
            this.log(`Error fetching data: ${error.message}`, 'error');
            console.error('Error fetching decibel data:', error);
            
            // Try to provide more specific error information
            if (error.message.includes('Load failed') || error.message.includes('Failed to fetch')) {
                this.log('This appears to be a CORS or network connectivity issue', 'warning');
                this.log('Check if the decibel meter server supports CORS or is accessible', 'warning');
            }
            
            return null;
        }
    }
    
    updateGauge(value) {
        // Normalize value to percentage (assuming 0-120 dB range)
        const normalizedValue = Math.max(0, Math.min(120, value));
        const percentage = (normalizedValue / 120) * 100;
        
        // Update gauge fill height
        this.gaugeFill.style.height = `${percentage}%`;
        
        // Update displayed value
        this.gaugeValue.textContent = Math.round(value);
        
        // Add pulse animation for high values
        if (value > 80) {
            this.gaugeFill.classList.add('active');
        } else {
            this.gaugeFill.classList.remove('active');
        }
        
        // Draw trailing graph if enabled
        if (this.trailingGraphToggle && this.trailingGraphToggle.checked) {
            this.drawTrailingGraph(value);
        } else {
            // Update regular gauge display
            this.gaugeValue.textContent = Math.round(value);
        }
        
        this.currentValue = value;
    }
    
    updateMaxValue(value) {
        // Update max value from decibel meter data
        this.maxValue = value;
        this.maxValueEl.textContent = `${Math.round(this.maxValue)} dB`;
    }
    
    updateElapsedTime(timeString) {
        // Throttle elapsed time updates to prevent jumping (update every 100ms max)
        const now = Date.now();
        if (now - this.lastElapsedTimeUpdate < 100) {
            return; // Skip update if less than 100ms since last update
        }
        
        // Only use real decibel meter time - no local timer fallback
        if (timeString && typeof timeString === 'string') {
            // Parse the time string (e.g., " 0h  2m 36.704s")
            const match = timeString.match(/(\d+)h\s+(\d+)m\s+(\d+\.?\d*)s/);
            if (match) {
                const hours = parseInt(match[1]);
                const minutes = parseInt(match[2]);
                const seconds = parseFloat(match[3]);
                
                // Convert to total minutes and seconds for XX:XX.X format
                const totalMinutes = (hours * 60) + minutes;
                const formattedMinutes = totalMinutes.toString().padStart(2, '0');
                const formattedSeconds = seconds.toFixed(1).padStart(4, '0');
                
                // Create consistent format: "XX:XX.X" (always 7 characters)
                const newTimeString = `${formattedMinutes}:${formattedSeconds}`;
                
                // Only update if the time has actually changed
                if (this.elapsedTimeEl.textContent !== newTimeString) {
                    this.elapsedTimeEl.textContent = newTimeString;
                    this.lastElapsedTimeUpdate = now;
                }
            } else {
                // If parsing fails, show "00:00.0" instead of falling back to local timer
                this.elapsedTimeEl.textContent = "00:00.0";
                this.lastElapsedTimeUpdate = now;
            }
        } else {
            // If no time string provided, show "00:00.0" instead of local timer
            this.elapsedTimeEl.textContent = "00:00.0";
            this.lastElapsedTimeUpdate = now;
        }
    }
    
    startPolling() {
        if (this.isPolling || !this.autoPollingInput.checked) return;
        
        this.isPolling = true;
        const interval = parseInt(this.pollingIntervalInput.value) || 100;
        
        this.pollingInterval = setInterval(async () => {
            const data = await this.fetchDecibelData();
            if (data !== null) {
                const decibelValue = this.extractValueFromJson(data);
                const maxValue = this.extractMaxValueFromJson(data);
                const elapsedTime = this.extractElapsedTimeFromJson(data);
                
                this.updateGauge(decibelValue);
                this.updateMaxValue(maxValue);
                this.updateElapsedTime(elapsedTime);
            }
        }, interval);
    }
    
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
        this.isPolling = false;
    }
    
    startTimer() {
        setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            this.elapsedTimeEl.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }
    
    updateGaugeColor() {
        const color = this.gaugeColorInput.value;
        this.gaugeFill.style.background = `linear-gradient(180deg, 
            ${this.hexToRgba(color, 0.8)} 0%,
            ${this.hexToRgba(color, 0.6)} 50%,
            ${this.hexToRgba(color, 0.4)} 100%)`;
        this.gaugeFill.style.boxShadow = 
            `0 0 20px ${this.hexToRgba(color, 0.5)}, inset 0 0 20px rgba(255, 255, 255, 0.2)`;
    }
    
    updateBackgroundColor() {
        const color = this.backgroundColorInput.value;
        // Update the gauge background element specifically
        const gaugeBackground = document.getElementById('gaugeBackground');
        if (gaugeBackground) {
            gaugeBackground.style.background = `linear-gradient(135deg, ${color} 0%, ${this.darkenColor(color, 20)} 100%)`;
        }
        this.log(`Gauge background color updated: ${color}`, 'info');
    }
    
    updateTextColor() {
        const color = this.textColorInput.value;
        // Only update main display text, not settings panel
        this.gaugeValue.style.color = color;
        this.maxValueEl.style.color = color;
        this.elapsedTimeEl.style.color = color;
        
        this.log(`Text color updated: ${color}`, 'info');
    }
    
    updateInfoPanelColor() {
        const color = this.infoPanelColorInput.value;
        const infoPanel = document.querySelector('.info-panel');
        if (infoPanel) {
            infoPanel.style.background = `linear-gradient(135deg, ${color} 0%, ${this.darkenColor(color, 15)} 100%)`;
        }
        this.log(`Info panel background color updated: ${color}`, 'info');
    }
    
    updateCanvasColor() {
        const color = this.canvasColorInput.value;
        document.body.style.backgroundColor = color;
        this.log(`Canvas color updated: ${color}`, 'info');
    }
    
    updateGaugeGlow() {
        const glowColor = this.gaugeGlowColorInput.value;
        const glowIntensity = parseInt(this.gaugeGlowIntensityInput.value) || 20;
        
        // Update the intensity value display
        this.gaugeGlowIntensityValue.textContent = `${glowIntensity}px`;
        
        // Update the gauge glass glow effect
        const gaugeGlass = document.querySelector('.gauge-glass');
        if (gaugeGlass) {
            gaugeGlass.style.boxShadow = 
                `0 0 ${glowIntensity}px ${this.hexToRgba(glowColor, 0.3)},
                inset 0 0 ${glowIntensity}px rgba(255, 255, 255, 0.05),
                0 0 0 1px rgba(255, 255, 255, 0.1)`;
        }
        
        // Update the gauge fill glow effect
        if (this.gaugeFill) {
            this.gaugeFill.style.boxShadow = 
                `0 0 ${Math.max(glowIntensity - 10, 5)}px ${this.hexToRgba(glowColor, 0.5)}, 
                inset 0 0 20px rgba(255, 255, 255, 0.2)`;
        }
        
        this.log(`Gauge glow updated: ${glowColor} at ${glowIntensity}px`, 'info');
    }
    
    updateContainerSize() {
        const width = parseInt(this.containerWidthInput.value) || 400;
        const height = parseInt(this.containerHeightInput.value) || 500;
        
        this.container.style.width = `${width}px`;
        this.container.style.height = `${height}px`;
        
        // Reinitialize canvas if trailing graph is active
        const currentDesign = this.gaugeDesignSelect ? this.gaugeDesignSelect.value : 'liquid-glass';
        if (currentDesign === 'trailing-graph') {
            this.initializeCanvas();
        }
        
        this.log(`Container size updated: ${width}x${height}px`, 'info');
    }
    
    toggleSettingsButton() {
        if (this.showSettingsInput.checked) {
            this.settingsToggle.classList.remove('hidden');
            this.keyboardHint.style.display = 'block';
        } else {
            this.settingsToggle.classList.add('hidden');
            this.keyboardHint.style.display = 'none';
        }
    }
    
    extractValueFromJson(data) {
        const jsonPath = this.jsonPathInput.value.trim();
        
        if (!jsonPath) {
            // Fallback to old logic if no path specified
            if (typeof data === 'number') {
                return data;
            } else if (data.decibel !== undefined) {
                return data.decibel;
            } else if (data.value !== undefined) {
                return data.value;
            } else if (data.dB !== undefined) {
                return data.dB;
            } else if (data.level !== undefined) {
                return data.level;
            } else {
                // Try to find any numeric value
                const numericKeys = Object.keys(data).filter(key => 
                    typeof data[key] === 'number'
                );
                if (numericKeys.length > 0) {
                    return data[numericKeys[0]];
                }
            }
            return 0;
        }
        
        // Use JSON path to extract value
        try {
            const value = this.getNestedValue(data, jsonPath);
            // Handle string numbers (like "47.9")
            if (typeof value === 'string') {
                const parsed = parseFloat(value);
                return isNaN(parsed) ? 0 : parsed;
            }
            return typeof value === 'number' ? value : 0;
        } catch (error) {
            console.warn('Error extracting value from JSON path:', error);
            return 0;
        }
    }
    
    extractMaxValueFromJson(data) {
        const maxJsonPath = this.maxJsonPathInput.value.trim();
        
        if (!maxJsonPath) {
            return this.maxValue; // Keep current max if no path specified
        }
        
        try {
            const value = this.getNestedValue(data, maxJsonPath);
            // Handle string numbers (like "119.4")
            if (typeof value === 'string') {
                const parsed = parseFloat(value);
                return isNaN(parsed) ? this.maxValue : parsed;
            }
            return typeof value === 'number' ? value : this.maxValue;
        } catch (error) {
            console.warn('Error extracting max value from JSON path:', error);
            return this.maxValue;
        }
    }
    
    extractElapsedTimeFromJson(data) {
        const elapsedJsonPath = this.elapsedJsonPathInput.value.trim();
        
        if (!elapsedJsonPath) {
            return this.getElapsedTime(); // Use local timer if no path specified
        }
        
        try {
            const value = this.getNestedValue(data, elapsedJsonPath);
            return typeof value === 'string' ? value : this.getElapsedTime();
        } catch (error) {
            console.warn('Error extracting elapsed time from JSON path:', error);
            return this.getElapsedTime();
        }
    }
    
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            if (current === undefined || current === null) return undefined;
            
            // Handle array indices (e.g., "0" for Channels.0.Level)
            if (Array.isArray(current)) {
                const index = parseInt(key);
                return !isNaN(index) ? current[index] : undefined;
            }
            
            return current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }
    
    async testPolling() {
        this.testPollingBtn.textContent = 'Testing...';
        this.testPollingBtn.disabled = true;
        
        try {
            this.log('Testing polling connection...', 'info');
            const data = await this.fetchDecibelData();
            if (data !== null) {
                const decibelValue = this.extractValueFromJson(data);
                const maxValue = this.extractMaxValueFromJson(data);
                const elapsedTime = this.extractElapsedTimeFromJson(data);
                
                this.updateGauge(decibelValue);
                this.updateMaxValue(maxValue);
                this.updateElapsedTime(elapsedTime);
                
                // Format elapsed time for display in XX:XX.X format
                let formattedElapsedTime = elapsedTime;
                if (elapsedTime && typeof elapsedTime === 'string') {
                    const match = elapsedTime.match(/(\d+)h\s+(\d+)m\s+(\d+\.?\d*)s/);
                    if (match) {
                        const hours = parseInt(match[1]);
                        const minutes = parseInt(match[2]);
                        const seconds = parseFloat(match[3]);
                        const totalMinutes = (hours * 60) + minutes;
                        const formattedMinutes = totalMinutes.toString().padStart(2, '0');
                        const formattedSeconds = seconds.toFixed(1).padStart(4, '0');
                        formattedElapsedTime = `${formattedMinutes}:${formattedSeconds}`;
                    }
                }
                
                this.jsonStatus.textContent = `✅ Success! Current: ${decibelValue} dB, Max: ${maxValue} dB, Time: ${formattedElapsedTime}`;
                this.jsonStatus.className = 'json-status success';
                this.jsonContent.textContent = JSON.stringify(data, null, 2);
                
                this.log(`Test polling successful - Current: ${decibelValue} dB, Max: ${maxValue} dB`, 'success');
            } else {
                this.jsonStatus.textContent = '❌ Failed to fetch data';
                this.jsonStatus.className = 'json-status error';
                this.jsonContent.textContent = 'No data received';
                
                this.log('Test polling failed - no data received', 'error');
            }
        } catch (error) {
            this.jsonStatus.textContent = `❌ Error: ${error.message}`;
            this.jsonStatus.className = 'json-status error';
            this.jsonContent.textContent = error.toString();
            
            this.log(`Test polling error: ${error.message}`, 'error');
        }
        
        this.testPollingBtn.textContent = 'Test Polling';
        this.testPollingBtn.disabled = false;
        this.showJsonPreview();
    }
    
    showJsonPreview() {
        this.jsonPreviewModal.classList.add('show');
    }
    
    hideJsonPreview() {
        this.jsonPreviewModal.classList.remove('show');
    }
    
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    darkenColor(hex, percent) {
        const num = parseInt(hex.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    
    saveSettings() {
        const settings = {
            pollingUrl: this.pollingUrlInput.value,
            autoPolling: this.autoPollingInput.checked,
            pollingInterval: this.pollingIntervalInput.value,
            jsonPath: this.jsonPathInput.value,
            maxJsonPath: this.maxJsonPathInput.value,
            elapsedJsonPath: this.elapsedJsonPathInput.value,
            enableLogging: this.enableLoggingInput.checked,
            gaugeColor: this.gaugeColorInput.value,
            canvasColor: this.canvasColorInput.value,
            backgroundColor: this.backgroundColorInput.value,
            textColor: this.textColorInput.value,
            infoPanelColor: this.infoPanelColorInput.value,
            gaugeGlowColor: this.gaugeGlowColorInput.value,
            gaugeGlowIntensity: this.gaugeGlowIntensityInput.value,
            transparentMode: this.transparentModeInput.checked,
            gaugeDesign: this.gaugeDesignSelect.value,
            trailingGraphEnabled: this.trailingGraphToggle.checked,
            containerWidth: this.containerWidthInput.value,
            containerHeight: this.containerHeightInput.value,
            showSettings: this.showSettingsInput.checked
        };
        localStorage.setItem('decibelMeterSettings', JSON.stringify(settings));
        this.log('Settings saved', 'info');
    }
    
    loadSettings() {
        const saved = localStorage.getItem('decibelMeterSettings');
        const settingsVersion = localStorage.getItem('decibelMeterSettingsVersion');
        const currentVersion = '2.0'; // Increment this to force settings reset
        
        // Force reset if version is old or if using old URL
        if (!settingsVersion || settingsVersion !== currentVersion || 
            (saved && JSON.parse(saved).pollingUrl && JSON.parse(saved).pollingUrl.includes('49994'))) {
            this.log('Settings version outdated or using old URL, resetting...', 'warning');
            this.resetSettings();
            localStorage.setItem('decibelMeterSettingsVersion', currentVersion);
            return;
        }
        
        if (saved) {
            const settings = JSON.parse(saved);
            this.pollingUrlInput.value = settings.pollingUrl || 'http://localhost:3000/proxy/meter/livedata';
            this.autoPollingInput.checked = settings.autoPolling !== false;
            this.pollingIntervalInput.value = settings.pollingInterval || 100;
            this.jsonPathInput.value = settings.jsonPath || 'Channels.0.Level';
            this.maxJsonPathInput.value = settings.maxJsonPath || 'Channels.0.Max';
            this.elapsedJsonPathInput.value = settings.elapsedJsonPath || 'Channels.0.Elapsed Time';
            this.enableLoggingInput.checked = settings.enableLogging !== false;
            this.gaugeColorInput.value = settings.gaugeColor || '#00ff88';
            this.canvasColorInput.value = settings.canvasColor || '#000000';
            this.backgroundColorInput.value = settings.backgroundColor || '#1a1a2e';
            this.textColorInput.value = settings.textColor || '#ffffff';
            this.infoPanelColorInput.value = settings.infoPanelColor || '#2a2a3e';
            this.gaugeGlowColorInput.value = settings.gaugeGlowColor || '#00d4ff';
            this.gaugeGlowIntensityInput.value = settings.gaugeGlowIntensity || 20;
        this.transparentModeInput.checked = settings.transparentMode || false;
        this.gaugeDesignSelect.value = settings.gaugeDesign || 'liquid-glass';
        this.trailingGraphToggle.checked = settings.trailingGraphEnabled || false;
            this.containerWidthInput.value = settings.containerWidth || 400;
            this.containerHeightInput.value = settings.containerHeight || 500;
            this.showSettingsInput.checked = settings.showSettings !== false;
            
            // Apply loaded settings
            this.updateGaugeColor();
            this.updateCanvasColor();
            this.updateBackgroundColor();
            this.updateTextColor();
            this.updateInfoPanelColor();
            this.updateGaugeGlow();
            this.toggleTransparentMode();
            this.updateGaugeDesign();
            this.toggleTrailingGraph();
            this.updateContainerSize();
            this.toggleSettingsButton();
            this.toggleLogging();
        }
    }
    
    // Sync functions for color picker and hex input
    syncHexInput(colorInputId, hexInputId) {
        const colorInput = document.getElementById(colorInputId);
        const hexInput = document.getElementById(hexInputId);
        if (colorInput && hexInput) {
            // Preserve the case that the user prefers, but ensure # prefix
            const colorValue = colorInput.value;
            hexInput.value = colorValue;
        }
    }
    
    syncColorInput(hexInputId, colorInputId) {
        const hexInput = document.getElementById(hexInputId);
        const colorInput = document.getElementById(colorInputId);
        if (hexInput && colorInput) {
            const hexValue = hexInput.value.trim();
            
            // Validate hex color format
            if (this.isValidHexColor(hexValue)) {
                // Clear any previous validation errors
                hexInput.setCustomValidity('');
                
                // Ensure hex value has # prefix, preserve case
                const normalizedHex = hexValue.startsWith('#') ? hexValue : '#' + hexValue;
                colorInput.value = normalizedHex;
                hexInput.value = normalizedHex; // Keep the case as typed
                
                // Update the corresponding color
                this.updateColorFromInput(colorInputId);
            } else if (hexValue.length > 0) {
                // Only mark as invalid if there's content (not empty)
                hexInput.setCustomValidity('Invalid hex color');
            } else {
                // Clear validation for empty input
                hexInput.setCustomValidity('');
            }
        }
    }
    
    isValidHexColor(hex) {
        // Remove # if present
        const cleanHex = hex.replace('#', '');
        // Check if it's 3 or 6 characters and contains only valid hex characters
        return /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(cleanHex);
    }
    
    updateColorFromInput(colorInputId) {
        switch (colorInputId) {
            case 'gaugeColor':
                this.updateGaugeColor();
                break;
            case 'canvasColor':
                this.updateCanvasColor();
                break;
            case 'backgroundColor':
                this.updateBackgroundColor();
                break;
            case 'textColor':
                this.updateTextColor();
                break;
            case 'infoPanelColor':
                this.updateInfoPanelColor();
                break;
            case 'gaugeGlowColor':
                this.updateGaugeGlow();
                break;
        }
    }
    
    toggleTransparentMode() {
        const isTransparent = this.transparentModeInput.checked;
        
        if (isTransparent) {
            // Enable transparent mode
            document.body.style.background = 'transparent';
            document.body.style.backgroundColor = 'transparent';
            this.log('Transparent mode enabled - ready for OBS Studio overlay', 'info');
        } else {
            // Disable transparent mode - restore canvas color
            this.updateCanvasColor();
            this.log('Transparent mode disabled - restored canvas color', 'info');
        }
    }
    
    updateGaugeDesign() {
        const design = this.gaugeDesignSelect.value;
        const gaugeElement = document.getElementById('gauge');
        
        // Remove all design classes
        gaugeElement.classList.remove('liquid-glass', 'neon-glow', 'minimal-flat', 'retro-analog');
        
        // Add the selected design class
        gaugeElement.classList.add(design);
        
        this.log(`Gauge design changed to: ${design}`, 'info');
    }
    
    toggleTrailingGraph() {
        const gaugeElement = document.getElementById('gauge');
        const isEnabled = this.trailingGraphToggle.checked;
        
        if (isEnabled) {
            // Show trailing graph, hide circular gauge
            if (this.trailingGraph) {
                this.trailingGraph.style.display = 'flex';
            }
            if (gaugeElement) {
                gaugeElement.style.display = 'none';
            }
            // Initialize canvas
            this.initializeCanvas();
            this.log('Trailing graph enabled', 'info');
        } else {
            // Show circular gauge, hide trailing graph
            if (gaugeElement) {
                gaugeElement.style.display = 'block';
            }
            if (this.trailingGraph) {
                this.trailingGraph.style.display = 'none';
            }
            this.log('Trailing graph disabled', 'info');
        }
    }
    
    initializeCanvas() {
        if (!this.trailingGraphCanvas || !this.trailingGraphCtx) return;
        
        const container = this.trailingGraphCanvas.parentElement;
        const width = container.offsetWidth;
        const height = container.offsetHeight;
        
        this.trailingGraphCanvas.width = width;
        this.trailingGraphCanvas.height = height;
        
        // Clear the canvas
        this.trailingGraphCtx.clearRect(0, 0, width, height);
    }
    
    drawTrailingGraph(value) {
        if (!this.trailingGraphCtx || !this.trailingGraphCanvas || !this.trailingGraphValue) return;
        
        // Update the current value display
        this.trailingGraphValue.textContent = Math.round(value);
        
        // Add new data point
        this.graphData.push(value);
        
        // Keep only the last maxGraphPoints
        if (this.graphData.length > this.maxGraphPoints) {
            this.graphData.shift();
        }
        
        const canvas = this.trailingGraphCanvas;
        const ctx = this.trailingGraphCtx;
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw background grid
        this.drawGrid(ctx, width, height);
        
        // Draw graph bars
        const barCount = this.graphData.length;
        if (barCount === 0) return;
        
        const barWidth = width / barCount;
        const maxValue = Math.max(...this.graphData, 1); // Avoid division by zero
        const padding = 10;
        
        // Get current gauge color
        const gaugeColor = this.gaugeColorInput ? this.gaugeColorInput.value : '#00ff88';
        
        this.graphData.forEach((val, index) => {
            const barHeight = (val / maxValue) * (height - padding * 2);
            const x = index * barWidth;
            const y = height - barHeight - padding;
            
            // Create gradient for the bar
            const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
            gradient.addColorStop(0, gaugeColor);
            gradient.addColorStop(1, this.darkenColor(gaugeColor, 30));
            
            // Draw bar
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth * 0.8, barHeight);
            
            // Add glow effect
            ctx.shadowColor = gaugeColor;
            ctx.shadowBlur = 5;
            ctx.fillRect(x, y, barWidth * 0.8, barHeight);
            
            // Reset shadow
            ctx.shadowBlur = 0;
        });
        
        // Draw current value indicator line
        const currentBarHeight = (value / maxValue) * (height - padding * 2);
        const currentY = height - currentBarHeight - padding;
        
        ctx.strokeStyle = gaugeColor;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(0, currentY);
        ctx.lineTo(width, currentY);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    drawGrid(ctx, width, height) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        // Draw horizontal grid lines
        const gridLines = 5;
        for (let i = 0; i <= gridLines; i++) {
            const y = (height / gridLines) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Draw vertical grid lines
        const verticalLines = 10;
        for (let i = 0; i <= verticalLines; i++) {
            const x = (width / verticalLines) * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const meter = new DecibelMeter();
    
    // Save settings when they change
    const inputs = document.querySelectorAll('.settings-content input');
    inputs.forEach(input => {
        input.addEventListener('change', () => {
            meter.saveSettings();
        });
    });
    
    // Handle page visibility changes to pause/resume polling
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            meter.stopPolling();
        } else if (meter.autoPollingInput.checked) {
            meter.startPolling();
        }
    });
});
