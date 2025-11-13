const PDFDocument = require('pdfkit');

// Generate order receipt PDF
const generateOrderReceipt = (order, orderLines) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50
            });

            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // Header
            doc.fontSize(20).text('Kitchenatics', { align: 'center' });
            doc.moveDown();
            doc.fontSize(16).text('Order Receipt', { align: 'center' });
            doc.moveDown();

            // Order details
            doc.fontSize(12);
            doc.text(`Order Number: ${order.orderNumber}`);
            doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`);
            doc.text(`Status: ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`);
            doc.moveDown();

            // Customer details
            doc.fontSize(14).text('Customer Information:', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(12);
            doc.text(`Name: ${order.customerDetails.name}`);
            doc.text(`Email: ${order.customerDetails.email}`);
            if (order.customerDetails.phone) {
                doc.text(`Phone: ${order.customerDetails.phone}`);
            }
            if (order.customerDetails.address) {
                doc.text(`Address: ${order.customerDetails.address}`);
            }
            if (order.customerDetails.zipCode) {
                doc.text(`ZIP Code: ${order.customerDetails.zipCode}`);
            }
            doc.moveDown();

            // Order items table
            const tableTop = doc.y + 20;
            const itemX = 50;
            const qtyX = 300;
            const priceX = 350;
            const totalX = 450;

            doc.fontSize(14).text('Order Items:', { underline: true });
            doc.moveDown();

            // Table headers
            doc.fontSize(12);
            doc.text('Product', itemX, tableTop);
            doc.text('Qty', qtyX, tableTop);
            doc.text('Price', priceX, tableTop);
            doc.text('Total', totalX, tableTop);

            // Draw header line
            doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

            let yPosition = tableTop + 25;

            // Table rows
            orderLines.forEach((line) => {
                doc.text(line.productDetails.name, itemX, yPosition);
                doc.text(line.quantity.toString(), qtyX, yPosition);
                doc.text(`₱${line.price.toFixed(2)}`, priceX, yPosition);
                doc.text(`₱${line.total.toFixed(2)}`, totalX, yPosition);

                yPosition += 20;
            });

            // Draw bottom line
            doc.moveTo(50, yPosition - 5).lineTo(550, yPosition - 5).stroke();

            yPosition += 20;

            // Totals
            const subtotal = order.subtotal;
            const tax = order.tax;
            const total = order.totalAmount;

            doc.text(`Subtotal: ₱${subtotal.toFixed(2)}`, 350, yPosition);
            yPosition += 20;
            doc.text(`Tax (8%): ₱${tax.toFixed(2)}`, 350, yPosition);
            yPosition += 20;
            doc.moveTo(350, yPosition - 5).lineTo(550, yPosition - 5).stroke();
            doc.fontSize(14).text(`Total: ₱${total.toFixed(2)}`, 350, yPosition);
            yPosition += 30;

            // Payment method
            doc.fontSize(12);
            doc.text(`Payment Method: ${order.paymentMethod.replace('_', ' ').toUpperCase()}`, 50, yPosition);
            if (order.paymentMethod === 'cash_on_delivery') {
                yPosition += 20;
                doc.text('Note: Payment will be collected upon delivery.', 50, yPosition);
            }

            // Footer
            doc.moveDown(2);
            doc.fontSize(10);
            doc.text('Thank you for shopping with Kitchenatics!', { align: 'center' });
            doc.text('For any questions, please contact our support team.', { align: 'center' });

            // Add page number
            const pageCount = doc.bufferedPageRange().count;
            for (let i = 0; i < pageCount; i++) {
                doc.switchToPage(i);
                doc.text(`Page ${i + 1} of ${pageCount}`, 50, doc.page.height - 50, { align: 'center' });
            }

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    generateOrderReceipt
};
