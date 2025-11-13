const PDFDocument = require('pdfkit');
const fs = require('fs');

// Test PDF generation
async function testPDFGeneration() {
    try {
        console.log('Testing PDF generation...');
        
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];

        doc.on('data', (chunk) => {
            buffers.push(chunk);
        });
        
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            console.log('PDF generated successfully, size:', pdfData.length, 'bytes');
            
            // Save to file for testing
            fs.writeFileSync('./test-receipt.pdf', pdfData);
            console.log('Test PDF saved as test-receipt.pdf');
        });

        // Simple PDF content
        doc.fontSize(24).fillColor('#4CAF50').text('KITCHENATICS', { align: 'center' });
        doc.fontSize(16).fillColor('black').text('TEST RECEIPT', { align: 'center' });
        doc.moveDown(2);
        
        doc.fontSize(12).text('Order Number: TEST-001');
        doc.text('Date: ' + new Date().toLocaleDateString());
        doc.moveDown();
        
        doc.text('Test Product - Qty: 1 - Price: ₱100.00');
        doc.moveDown();
        
        doc.text('Total: ₱100.00');
        
        doc.end();
        
    } catch (error) {
        console.error('PDF generation failed:', error);
    }
}

testPDFGeneration();
