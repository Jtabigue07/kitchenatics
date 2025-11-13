const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: 'sandbox.smtp.mailtrap.io',
        port: 2525,
        auth: {
            user: 'e49c424618c468',
            pass: 'b48305592237c5'
        },
        debug: true,
        logger: true
    });
};

// Send order confirmation email
const sendOrderConfirmation = async (order, orderLines, customerEmail) => {
    try {
        const transporter = createTransporter();

        // Calculate totals
        const subtotal = order.subtotal;
        const tax = order.tax;
        const total = order.totalAmount;

        // Create order items HTML
        const orderItemsHtml = orderLines.map(line => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${line.productDetails.name}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${line.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₱${line.price.toFixed(2)}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₱${line.total.toFixed(2)}</td>
            </tr>
        `).join('');

        const mailOptions = {
            from: `"Kitchenatics" <noreply@kitchenatics.com>`,
            to: customerEmail,
            subject: `Order Confirmation - ${order.orderNumber}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
                        <h1>Order Confirmation</h1>
                        <p>Thank you for your order!</p>
                    </div>

                    <div style="padding: 20px;">
                        <h2>Order Details</h2>
                        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                        <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>

                        <h3>Customer Information</h3>
                        <p><strong>Name:</strong> ${order.customerDetails.name}</p>
                        <p><strong>Email:</strong> ${order.customerDetails.email}</p>
                        ${order.customerDetails.phone ? `<p><strong>Phone:</strong> ${order.customerDetails.phone}</p>` : ''}
                        ${order.customerDetails.address ? `<p><strong>Address:</strong> ${order.customerDetails.address}</p>` : ''}
                        ${order.customerDetails.zipCode ? `<p><strong>ZIP Code:</strong> ${order.customerDetails.zipCode}</p>` : ''}

                        <h3>Order Items</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background-color: #f8f9fa;">
                                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Product</th>
                                    <th style="padding: 10px; text-align: center; border-bottom: 2px solid #dee2e6;">Qty</th>
                                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Price</th>
                                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${orderItemsHtml}
                            </tbody>
                        </table>

                        <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                <span>Subtotal:</span>
                                <span>₱${subtotal.toFixed(2)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                <span>Tax (8%):</span>
                                <span>₱${tax.toFixed(2)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; margin-top: 10px; padding-top: 10px; border-top: 2px solid #dee2e6;">
                                <span>Total:</span>
                                <span>₱${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div style="margin-top: 30px; padding: 15px; background-color: #e8f5e8; border-left: 4px solid #4CAF50;">
                            <h4 style="margin-top: 0; color: #2e7d32;">Payment Method</h4>
                            <p style="margin-bottom: 0;">${order.paymentMethod.replace('_', ' ').toUpperCase()}</p>
                            ${order.paymentMethod === 'cash_on_delivery' ? '<p>You will pay for your order when it is delivered to your address.</p>' : ''}
                        </div>

                        <div style="margin-top: 30px; text-align: center;">
                            <p>If you have any questions about your order, please contact us.</p>
                            <p>Thank you for shopping with Kitchenatics!</p>
                        </div>
                    </div>

                    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666;">
                        <p>&copy; 2024 Kitchenatics. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Order confirmation email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending order confirmation email:', error);
        return { success: false, error: error.message };
    }
};

// Generate PDF receipt using PDFKit
const generatePDFReceipt = async (order, orderLines) => {
    try {
        // Calculate totals
        const subtotal = order.subtotal || 0;
        const tax = order.tax || 0;
        const total = order.totalAmount || 0;

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];

            doc.on('data', (chunk) => {
                buffers.push(chunk);
            });
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                console.log('PDF generation completed, buffer size:', pdfData.length);
                resolve(pdfData);
            });
            doc.on('error', (error) => {
                console.error('PDF generation error:', error);
                reject(error);
            });

            // Header
            doc.fontSize(24).fillColor('#4CAF50').text('KITCHENATICS', { align: 'center' });
            doc.fontSize(16).fillColor('black').text('ORDER RECEIPT', { align: 'center' });
            doc.moveDown(2);

            // Order Information
            doc.fontSize(12).fillColor('black');
            doc.text(`Order Number: ${order.orderNumber}`, 50);
            doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`);
            doc.text(`Status: ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`);
            doc.text(`Payment Method: ${order.paymentMethod?.replace('_', ' ').toUpperCase() || 'N/A'}`);
            doc.moveDown();

            // Customer Information
            doc.fontSize(14).text('Customer Information:', { underline: true });
            doc.fontSize(12);
            doc.text(`Name: ${order.customerDetails?.name || 'N/A'}`);
            doc.text(`Email: ${order.customerDetails?.email || 'N/A'}`);
            if (order.customerDetails?.phone) {
                doc.text(`Phone: ${order.customerDetails.phone}`);
            }
            if (order.customerDetails?.address) {
                doc.text(`Address: ${order.customerDetails.address}`);
            }
            if (order.customerDetails?.zipCode) {
                doc.text(`ZIP Code: ${order.customerDetails.zipCode}`);
            }
            doc.moveDown();

            // Order Items Table
            doc.fontSize(14).text('Order Items:', { underline: true });
            doc.moveDown(0.5);

            // Table headers
            const tableTop = doc.y;
            const itemX = 50;
            const qtyX = 300;
            const priceX = 350;
            const totalX = 450;

            doc.fontSize(10).fillColor('black');
            doc.text('Product', itemX, tableTop, { width: 240 });
            doc.text('Qty', qtyX, tableTop, { width: 40, align: 'center' });
            doc.text('Price', priceX, tableTop, { width: 80, align: 'right' });
            doc.text('Total', totalX, tableTop, { width: 80, align: 'right' });

            // Draw line under headers
            doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

            // Table rows
            let currentY = tableTop + 25;
            orderLines.forEach((line, index) => {
                if (currentY > 700) { // Start new page if needed
                    doc.addPage();
                    currentY = 50;
                }

                doc.text(line.productDetails?.name || 'Product', itemX, currentY, { width: 240 });
                doc.text(line.quantity.toString(), qtyX, currentY, { width: 40, align: 'center' });
                doc.text(`₱${(line.price || 0).toFixed(2)}`, priceX, currentY, { width: 80, align: 'right' });
                doc.text(`₱${(line.total || 0).toFixed(2)}`, totalX, currentY, { width: 80, align: 'right' });
                
                currentY += 20;
            });

            // Draw line before totals
            doc.moveTo(350, currentY).lineTo(550, currentY).stroke();
            currentY += 10;

            // Totals
            doc.fontSize(10);
            doc.text('Subtotal:', priceX, currentY, { width: 80, align: 'right' });
            doc.text(`₱${subtotal.toFixed(2)}`, totalX, currentY, { width: 80, align: 'right' });
            currentY += 15;

            doc.text('Tax (8%):', priceX, currentY, { width: 80, align: 'right' });
            doc.text(`₱${tax.toFixed(2)}`, totalX, currentY, { width: 80, align: 'right' });
            currentY += 15;

            // Draw line before grand total
            doc.moveTo(350, currentY).lineTo(550, currentY).stroke();
            currentY += 10;

            doc.fontSize(12).fillColor('black');
            doc.text('Grand Total:', priceX, currentY, { width: 80, align: 'right' });
            doc.text(`₱${total.toFixed(2)}`, totalX, currentY, { width: 80, align: 'right' });

            // Footer
            doc.fontSize(10).fillColor('gray');
            doc.text('Thank you for your business!', 50, doc.page.height - 100, { align: 'center' });
            doc.text('© 2024 Kitchenatics. All rights reserved.', { align: 'center' });
            doc.text(`Generated on ${new Date().toLocaleString()}`, { align: 'center' });

            doc.end();
        });
    } catch (error) {
        console.error('Error generating PDF receipt:', error);
        throw error;
    }
};

// Send order status update email with detailed products and PDF receipt
const sendOrderStatusUpdate = async (order, newStatus, customerEmail, orderLines = []) => {
    try {
        const transporter = createTransporter();

        // Calculate totals
        const subtotal = order.subtotal || 0;
        const tax = order.tax || 0;
        const total = order.totalAmount || 0;

        const statusMessages = {
            processing: 'Your order is now being processed.',
            shipped: 'Your order has been shipped and is on its way!',
            delivered: 'Your order has been delivered successfully.',
            cancelled: 'Your order has been cancelled.'
        };

        // Create order items HTML for email
        const orderItemsHtml = orderLines.map(line => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${line.productDetails?.name || 'Product'}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${line.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₱${(line.price || 0).toFixed(2)}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₱${(line.total || 0).toFixed(2)}</td>
            </tr>
        `).join('');

        // Generate PDF receipt
        let pdfBuffer = null;
        try {
            pdfBuffer = await generatePDFReceipt(order, orderLines);
            console.log('PDF receipt generated successfully, buffer size:', pdfBuffer ? pdfBuffer.length : 0);
        } catch (pdfError) {
            console.error('Failed to generate PDF receipt:', pdfError);
        }

        const mailOptions = {
            from: `"Kitchenatics" <noreply@kitchenatics.com>`,
            to: customerEmail,
            subject: `Order Status Update - ${order.orderNumber}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #2196F3; color: white; padding: 20px; text-align: center;">
                        <h1>Order Status Update</h1>
                    </div>

                    <div style="padding: 20px;">
                        <h2>Order ${order.orderNumber}</h2>
                        <p><strong>Status:</strong> ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}</p>
                        <p><strong>Updated Date:</strong> ${new Date().toLocaleDateString()}</p>

                        <div style="margin: 30px 0; padding: 20px; background-color: #e3f2fd; border-radius: 5px; border-left: 4px solid #2196F3;">
                            <p style="margin: 0; font-size: 16px;">${statusMessages[newStatus] || 'Your order status has been updated.'}</p>
                        </div>

                        <h3>Order Items</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background-color: #f8f9fa;">
                                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Product</th>
                                    <th style="padding: 10px; text-align: center; border-bottom: 2px solid #dee2e6;">Qty</th>
                                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Price</th>
                                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${orderItemsHtml}
                            </tbody>
                        </table>

                        <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                <span>Subtotal:</span>
                                <span>₱${subtotal.toFixed(2)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                <span>Tax (8%):</span>
                                <span>₱${tax.toFixed(2)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; margin-top: 10px; padding-top: 10px; border-top: 2px solid #dee2e6;">
                                <span>Grand Total:</span>
                                <span>₱${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #e8f5e8; border-radius: 5px; border-left: 4px solid #4CAF50;">
                            <p style="margin: 0; font-size: 14px; color: #2e7d32;">
                                <strong>📄 Receipt Available</strong><br>
                                You can download your receipt PDF from your order history in your account dashboard.
                            </p>
                        </div>

                        <div style="margin-top: 30px; text-align: center;">
                            <p>If you have any questions, please contact our support team.</p>
                            <p>Thank you for choosing Kitchenatics!</p>
                            ${pdfBuffer ? '<p><strong>Receipt attached as PDF</strong></p>' : ''}
                        </div>
                    </div>

                    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666;">
                        <p>&copy; 2024 Kitchenatics. All rights reserved.</p>
                    </div>
                </div>
            `,
            attachments: pdfBuffer ? [{
                filename: `Receipt-${order.orderNumber}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
            }] : []
        };

        console.log('Sending email with attachments:', mailOptions.attachments.length > 0 ? 'YES' : 'NO');
        if (mailOptions.attachments.length > 0) {
            console.log('Attachment details:', {
                filename: mailOptions.attachments[0].filename,
                contentType: mailOptions.attachments[0].contentType,
                bufferSize: mailOptions.attachments[0].content.length
            });
        }

        const info = await transporter.sendMail(mailOptions);
        console.log('Order status update email sent with receipt:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending order status update email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendOrderConfirmation,
    sendOrderStatusUpdate,
    generatePDFReceipt
};
