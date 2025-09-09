// Fallback Chart Implementation for Stock Market Directory
// Simple canvas-based charting when Chart.js is not available

class SimpleChart {
    constructor(ctx, config) {
        this.ctx = ctx;
        this.canvas = ctx.canvas;
        this.config = config;
        this.data = config.data;
        this.options = config.options || {};
        
        // Set canvas size
        this.canvas.width = this.canvas.offsetWidth * 2;
        this.canvas.height = this.canvas.offsetHeight * 2;
        this.ctx.scale(2, 2);
        
        this.render();
    }
    
    render() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        const data = this.data.datasets[0].data;
        const labels = this.data.labels;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set up dimensions
        const padding = 40;
        const chartWidth = canvas.width / 2 - padding * 2;
        const chartHeight = canvas.height / 2 - padding * 2;
        
        // Find min/max values
        const minValue = Math.min(...data);
        const maxValue = Math.max(...data);
        const valueRange = maxValue - minValue;
        
        // Draw grid
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        
        // Horizontal grid lines
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(padding + chartWidth, y);
            ctx.stroke();
        }
        
        // Vertical grid lines
        const stepSize = Math.max(1, Math.floor(labels.length / 10));
        for (let i = 0; i < labels.length; i += stepSize) {
            const x = padding + (chartWidth / (labels.length - 1)) * i;
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, padding + chartHeight);
            ctx.stroke();
        }
        
        // Draw line chart
        ctx.strokeStyle = data[data.length - 1] >= data[0] ? '#22c55e' : '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < data.length; i++) {
            const x = padding + (chartWidth / (data.length - 1)) * i;
            const y = padding + chartHeight - ((data[i] - minValue) / valueRange) * chartHeight;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
        
        // Draw fill area
        ctx.fillStyle = data[data.length - 1] >= data[0] ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)';
        ctx.lineTo(padding + chartWidth, padding + chartHeight);
        ctx.lineTo(padding, padding + chartHeight);
        ctx.closePath();
        ctx.fill();
        
        // Draw y-axis labels
        ctx.fillStyle = '#6b7280';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'right';
        
        for (let i = 0; i <= 5; i++) {
            const value = maxValue - (valueRange / 5) * i;
            const y = padding + (chartHeight / 5) * i;
            ctx.fillText('$' + value.toFixed(2), padding - 5, y + 3);
        }
        
        // Draw x-axis labels
        ctx.textAlign = 'center';
        const labelStep = Math.max(1, Math.floor(labels.length / 8));
        for (let i = 0; i < labels.length; i += labelStep) {
            const x = padding + (chartWidth / (labels.length - 1)) * i;
            ctx.fillText(labels[i], x, padding + chartHeight + 15);
        }
    }
    
    update() {
        this.render();
    }
    
    destroy() {
        // Simple cleanup
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// Mock Chart.js API
if (typeof Chart === 'undefined') {
    window.Chart = SimpleChart;
}