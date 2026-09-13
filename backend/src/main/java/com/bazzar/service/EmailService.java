package com.bazzar.service;

import com.bazzar.entity.Product;
import com.bazzar.entity.StoreAdminApplication;
import com.bazzar.entity.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${app.mail.from-name:Bazzar Marketplace}")
    private String fromName;

    @Value("${app.mail.from-email:}")
    private String fromEmail;

    /**
     * Sends an email when a user submits or re-submits their seller application.
     */
    @Async
    public void sendApplicationSubmittedEmail(User user, StoreAdminApplication app) {
        String recipient = user.getEmail();
        String subject = "Seller Application Received — " + app.getBusinessName() + " | Bazzar Marketplace";

        String pickupLocation = formatPickupAddress(app);

        String html = """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f7f5; margin: 0; padding: 24px; color: #111111; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e8e8e8; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
                .header { background: #111111; padding: 28px 32px; text-align: center; }
                .brand { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff; margin: 0; }
                .brand span { color: #4f46e5; }
                .content { padding: 36px 32px; }
                .badge { display: inline-block; background: #fef3c7; color: #92400e; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 12px; border-radius: 9999px; letter-spacing: 0.5px; margin-bottom: 16px; border: 1px solid #fde68a; }
                h1 { font-size: 22px; font-weight: 800; margin: 0 0 12px; color: #111111; }
                p { font-size: 14px; line-height: 1.6; color: #4b5563; margin: 0 0 16px; }
                .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 14px; padding: 20px; margin: 24px 0; }
                .card-title { font-size: 13px; font-weight: 700; text-transform: uppercase; color: #6b7280; letter-spacing: 0.5px; margin-bottom: 12px; }
                .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
                .detail-row:last-child { border-bottom: none; }
                .detail-label { color: #6b7280; font-weight: 500; }
                .detail-value { color: #111111; font-weight: 600; text-align: right; }
                .footer { background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 32px; text-align: center; font-size: 12px; color: #9ca3af; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2 class="brand">BAZ<span>ZAR</span></h2>
                </div>
                <div class="content">
                  <div class="badge">Application Under Review</div>
                  <h1>Thank you for applying, %s!</h1>
                  <p>We have successfully received your seller application for <strong>%s</strong>. Our platform Super Admin is actively verifying your business credentials, tax KYC, and pickup warehouse details.</p>
                  
                  <div class="card">
                    <div class="card-title">Submitted Application Summary</div>
                    <div class="detail-row"><span class="detail-label">Store Name:</span><span class="detail-value">%s</span></div>
                    <div class="detail-row"><span class="detail-label">Category:</span><span class="detail-value">%s</span></div>
                    <div class="detail-row"><span class="detail-label">PAN Number:</span><span class="detail-value">%s</span></div>
                    <div class="detail-row"><span class="detail-label">GSTIN:</span><span class="detail-value">%s</span></div>
                    <div class="detail-row"><span class="detail-label">Pickup Location:</span><span class="detail-value">%s</span></div>
                    <div class="detail-row"><span class="detail-label">Pickup Contact:</span><span class="detail-value">%s (%s)</span></div>
                  </div>

                  <p><strong>What happens next?</strong></p>
                  <p>Our verification team reviews applications within <strong>24–48 hours</strong>. Once reviewed, you will receive an email update confirming your approval or providing instructions if any adjustments are needed.</p>
                </div>
                <div class="footer">
                  &copy; Bazzar Marketplace. This is an automated notification sent to %s.
                </div>
              </div>
            </body>
            </html>
            """.formatted(
                user.getName(),
                app.getBusinessName(),
                app.getBusinessName(),
                app.getBusinessType() != null ? app.getBusinessType() : "General",
                app.getPanNumber() != null ? app.getPanNumber() : "—",
                app.getGstNumber() != null ? app.getGstNumber() : "Not Provided",
                pickupLocation,
                app.getPickupContactName() != null ? app.getPickupContactName() : user.getName(),
                app.getPickupContactPhone() != null ? app.getPickupContactPhone() : app.getContactPhone(),
                recipient
        );

        sendEmail(recipient, subject, html);
    }

    /**
     * Sends an email when the super admin approves the seller application.
     */
    @Async
    public void sendApplicationApprovedEmail(User user, StoreAdminApplication app) {
        String recipient = user.getEmail();
        String subject = "🎉 Congratulations! Your Bazzar Seller Account is Approved — " + app.getBusinessName();

        String pickupLocation = formatPickupAddress(app);
        String adminNoteSection = (app.getSuperAdminNote() != null && !app.getSuperAdminNote().isBlank())
                ? "<div class=\"note-box\"><strong>Super Admin Message:</strong><p style=\"margin: 6px 0 0; color: #111111;\">" + app.getSuperAdminNote() + "</p></div>"
                : "";

        String html = """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f7f5; margin: 0; padding: 24px; color: #111111; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e8e8e8; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
                .header { background: #111111; padding: 28px 32px; text-align: center; }
                .brand { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff; margin: 0; }
                .brand span { color: #10b981; }
                .content { padding: 36px 32px; }
                .badge { display: inline-block; background: #d1fae5; color: #065f46; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 12px; border-radius: 9999px; letter-spacing: 0.5px; margin-bottom: 16px; border: 1px solid #a7f3d0; }
                h1 { font-size: 22px; font-weight: 800; margin: 0 0 12px; color: #111111; }
                p { font-size: 14px; line-height: 1.6; color: #4b5563; margin: 0 0 16px; }
                .note-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 14px 18px; margin: 18px 0; font-size: 13px; color: #166534; }
                .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 14px; padding: 20px; margin: 24px 0; }
                .card-title { font-size: 13px; font-weight: 700; text-transform: uppercase; color: #6b7280; letter-spacing: 0.5px; margin-bottom: 12px; }
                .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
                .detail-row:last-child { border-bottom: none; }
                .detail-label { color: #6b7280; font-weight: 500; }
                .detail-value { color: #111111; font-weight: 600; text-align: right; }
                .cta-btn { display: block; text-align: center; background: #111111; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 14px; margin: 28px 0; }
                .footer { background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 32px; text-align: center; font-size: 12px; color: #9ca3af; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2 class="brand">BAZ<span>ZAR</span></h2>
                </div>
                <div class="content">
                  <div class="badge">Approved & Activated</div>
                  <h1>Welcome aboard, %s!</h1>
                  <p>Congratulations! Your seller application for <strong>%s</strong> has been verified and <strong>approved</strong> by our platform Super Admin.</p>
                  
                  %s

                  <div class="card">
                    <div class="card-title">Verified Store & Pickup Details</div>
                    <div class="detail-row"><span class="detail-label">Store Name:</span><span class="detail-value">%s</span></div>
                    <div class="detail-row"><span class="detail-label">Role Upgrade:</span><span class="detail-value">Authorized Seller</span></div>
                    <div class="detail-row"><span class="detail-label">Pickup Warehouse:</span><span class="detail-value">%s</span></div>
                    <div class="detail-row"><span class="detail-label">Bank Payout:</span><span class="detail-value">%s (%s)</span></div>
                  </div>

                  <p>Your account has been elevated to <strong>Store Admin / Seller</strong>. You can now list your products, manage inventory, and receive courier pickups for fulfilled orders.</p>

                  <a href="http://localhost:3000/store-admin" class="cta-btn">Access Seller Dashboard &rarr;</a>
                </div>
                <div class="footer">
                  &copy; Bazzar Marketplace. Sent to %s.
                </div>
              </div>
            </body>
            </html>
            """.formatted(
                user.getName(),
                app.getBusinessName(),
                adminNoteSection,
                app.getBusinessName(),
                pickupLocation,
                app.getBankName() != null ? app.getBankName() : "Bank Account",
                app.getBankIfscCode() != null ? app.getBankIfscCode() : "Verified",
                recipient
        );

        sendEmail(recipient, subject, html);
    }

    /**
     * Sends an email when the super admin rejects the seller application with remarks.
     */
    @Async
    public void sendApplicationRejectedEmail(User user, StoreAdminApplication app, String remark) {
        String recipient = user.getEmail();
        String subject = "Action Required: Update on your Bazzar Seller Application — " + app.getBusinessName();

        String html = """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f7f5; margin: 0; padding: 24px; color: #111111; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e8e8e8; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
                .header { background: #111111; padding: 28px 32px; text-align: center; }
                .brand { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff; margin: 0; }
                .brand span { color: #ef4444; }
                .content { padding: 36px 32px; }
                .badge { display: inline-block; background: #fee2e2; color: #991b1b; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 12px; border-radius: 9999px; letter-spacing: 0.5px; margin-bottom: 16px; border: 1px solid #fecaca; }
                h1 { font-size: 22px; font-weight: 800; margin: 0 0 12px; color: #111111; }
                p { font-size: 14px; line-height: 1.6; color: #4b5563; margin: 0 0 16px; }
                .remark-card { background: #fff5f5; border: 2px solid #fed7d7; border-radius: 14px; padding: 20px; margin: 24px 0; }
                .remark-title { font-size: 12px; font-weight: 800; text-transform: uppercase; color: #c53030; letter-spacing: 0.5px; margin-bottom: 8px; }
                .remark-body { font-size: 14px; font-weight: 600; color: #742a2a; line-height: 1.5; white-space: pre-wrap; margin: 0; }
                .cta-btn { display: block; text-align: center; background: #3f46d8; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 14px; margin: 28px 0; }
                .footer { background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 32px; text-align: center; font-size: 12px; color: #9ca3af; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2 class="brand">BAZ<span>ZAR</span></h2>
                </div>
                <div class="content">
                  <div class="badge">Changes Required</div>
                  <h1>Hello %s,</h1>
                  <p>Thank you for your interest in partnering with Bazzar as a seller. After reviewing your application for <strong>%s</strong>, our platform Super Admin has identified changes that need to be made before your store can be approved.</p>
                  
                  <div class="remark-card">
                    <div class="remark-title">Required Changes / Super Admin Remark:</div>
                    <p class="remark-body">%s</p>
                  </div>

                  <p><strong>How to proceed:</strong></p>
                  <p>Please click the button below to update the requested information (e.g. valid GSTIN, clear warehouse pickup address, or KYC clarification) and re-submit. Your pre-filled form is waiting for you.</p>

                  <a href="http://localhost:3000/become-seller" class="cta-btn">Review &amp; Re-Submit Application &rarr;</a>
                </div>
                <div class="footer">
                  &copy; Bazzar Marketplace. Sent to %s.
                </div>
              </div>
            </body>
            </html>
            """.formatted(
                user.getName(),
                app.getBusinessName(),
                remark,
                recipient
        );

        sendEmail(recipient, subject, html);
    }

    /**
     * Sends an email when a seller submits or re-submits a product for review.
     */
    @Async
    public void sendProductSubmittedEmail(User seller, Product product) {
        String recipient = seller.getEmail();
        String subject = "Product Submitted for Review — " + product.getName() + " | Bazzar";

        String html = """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f7f5; margin: 0; padding: 24px; color: #111111; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e8e8e8; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
                .header { background: #111111; padding: 28px 32px; text-align: center; }
                .brand { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff; margin: 0; }
                .brand span { color: #4f46e5; }
                .content { padding: 36px 32px; }
                .badge { display: inline-block; background: #fef3c7; color: #92400e; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 12px; border-radius: 9999px; letter-spacing: 0.5px; margin-bottom: 16px; border: 1px solid #fde68a; }
                h1 { font-size: 22px; font-weight: 800; margin: 0 0 12px; color: #111111; }
                p { font-size: 14px; line-height: 1.6; color: #4b5563; margin: 0 0 16px; }
                .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 14px; padding: 20px; margin: 24px 0; }
                .card-title { font-size: 13px; font-weight: 700; text-transform: uppercase; color: #6b7280; letter-spacing: 0.5px; margin-bottom: 12px; }
                .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
                .detail-row:last-child { border-bottom: none; }
                .detail-label { color: #6b7280; font-weight: 500; }
                .detail-value { color: #111111; font-weight: 600; text-align: right; }
                .footer { background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 32px; text-align: center; font-size: 12px; color: #9ca3af; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2 class="brand">BAZ<span>ZAR</span></h2>
                </div>
                <div class="content">
                  <div class="badge">Product Under Verification</div>
                  <h1>Product Received for Review, %s!</h1>
                  <p>Your product listing for <strong>%s</strong> has been submitted and is currently being verified by the Super Admin.</p>
                  
                  <div class="card">
                    <div class="card-title">Product Details</div>
                    <div class="detail-row"><span class="detail-label">Product Name:</span><span class="detail-value">%s</span></div>
                    <div class="detail-row"><span class="detail-label">Listing Price:</span><span class="detail-value">₹%s</span></div>
                    <div class="detail-row"><span class="detail-label">Stock Units:</span><span class="detail-value">%d units</span></div>
                    <div class="detail-row"><span class="detail-label">Category:</span><span class="detail-value">%s</span></div>
                  </div>

                  <p>Once approved by the Super Admin, the product will immediately be published live on the Bazzar public catalog for all customers to purchase.</p>
                </div>
                <div class="footer">
                  &copy; Bazzar Marketplace. Sent to %s.
                </div>
              </div>
            </body>
            </html>
            """.formatted(
                seller.getName(),
                product.getName(),
                product.getName(),
                product.getPrice() != null ? product.getPrice().toString() : "0.00",
                product.getStock() != null ? product.getStock() : 0,
                product.getCategory() != null ? product.getCategory().getName() : "General",
                recipient
        );

        sendEmail(recipient, subject, html);
    }

    /**
     * Sends an email when the super admin approves a product and makes it live on the marketplace.
     */
    @Async
    public void sendProductApprovedEmail(User seller, Product product) {
        String recipient = seller.getEmail();
        String subject = "🎉 Your Product is Live on Bazzar! — " + product.getName();

        String html = """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f7f5; margin: 0; padding: 24px; color: #111111; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e8e8e8; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
                .header { background: #111111; padding: 28px 32px; text-align: center; }
                .brand { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff; margin: 0; }
                .brand span { color: #10b981; }
                .content { padding: 36px 32px; }
                .badge { display: inline-block; background: #d1fae5; color: #065f46; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 12px; border-radius: 9999px; letter-spacing: 0.5px; margin-bottom: 16px; border: 1px solid #a7f3d0; }
                h1 { font-size: 22px; font-weight: 800; margin: 0 0 12px; color: #111111; }
                p { font-size: 14px; line-height: 1.6; color: #4b5563; margin: 0 0 16px; }
                .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 14px; padding: 20px; margin: 24px 0; }
                .card-title { font-size: 13px; font-weight: 700; text-transform: uppercase; color: #6b7280; letter-spacing: 0.5px; margin-bottom: 12px; }
                .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
                .detail-row:last-child { border-bottom: none; }
                .detail-label { color: #6b7280; font-weight: 500; }
                .detail-value { color: #111111; font-weight: 600; text-align: right; }
                .cta-btn { display: block; text-align: center; background: #111111; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 14px; margin: 28px 0; }
                .footer { background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 32px; text-align: center; font-size: 12px; color: #9ca3af; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2 class="brand">BAZ<span>ZAR</span></h2>
                </div>
                <div class="content">
                  <div class="badge">Product Published &amp; Live</div>
                  <h1>Great news, %s!</h1>
                  <p>Your product <strong>%s</strong> has been reviewed and <strong>approved</strong> by the Super Admin. It is now published live on Bazzar for millions of verified buyers!</p>
                  
                  <div class="card">
                    <div class="card-title">Live Product Summary</div>
                    <div class="detail-row"><span class="detail-label">Product Name:</span><span class="detail-value">%s</span></div>
                    <div class="detail-row"><span class="detail-label">Listing Price:</span><span class="detail-value">₹%s</span></div>
                    <div class="detail-row"><span class="detail-label">Available Inventory:</span><span class="detail-value">%d units</span></div>
                    <div class="detail-row"><span class="detail-label">Status:</span><span class="detail-value" style="color: #059669;">Active &amp; Visible</span></div>
                  </div>

                  <p>When customers order this product, courier partners will be dispatched to your registered pickup warehouse to collect the package.</p>

                  <a href="http://localhost:3000/store-admin/products" class="cta-btn">Manage Products in Dashboard &rarr;</a>
                </div>
                <div class="footer">
                  &copy; Bazzar Marketplace. Sent to %s.
                </div>
              </div>
            </body>
            </html>
            """.formatted(
                seller.getName(),
                product.getName(),
                product.getName(),
                product.getPrice() != null ? product.getPrice().toString() : "0.00",
                product.getStock() != null ? product.getStock() : 0,
                recipient
        );

        sendEmail(recipient, subject, html);
    }

    /**
     * Sends an email when the super admin rejects a product with a reason.
     */
    @Async
    public void sendProductRejectedEmail(User seller, Product product, String reason) {
        String recipient = seller.getEmail();
        String subject = "Action Required: Product Needs Changes — " + product.getName() + " | Bazzar";

        String html = """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f7f5; margin: 0; padding: 24px; color: #111111; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e8e8e8; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
                .header { background: #111111; padding: 28px 32px; text-align: center; }
                .brand { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff; margin: 0; }
                .brand span { color: #ef4444; }
                .content { padding: 36px 32px; }
                .badge { display: inline-block; background: #fee2e2; color: #991b1b; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 12px; border-radius: 9999px; letter-spacing: 0.5px; margin-bottom: 16px; border: 1px solid #fecaca; }
                h1 { font-size: 22px; font-weight: 800; margin: 0 0 12px; color: #111111; }
                p { font-size: 14px; line-height: 1.6; color: #4b5563; margin: 0 0 16px; }
                .remark-card { background: #fff5f5; border: 2px solid #fed7d7; border-radius: 14px; padding: 20px; margin: 24px 0; }
                .remark-title { font-size: 12px; font-weight: 800; text-transform: uppercase; color: #c53030; letter-spacing: 0.5px; margin-bottom: 8px; }
                .remark-body { font-size: 14px; font-weight: 600; color: #742a2a; line-height: 1.5; white-space: pre-wrap; margin: 0; }
                .cta-btn { display: block; text-align: center; background: #3f46d8; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 14px; margin: 28px 0; }
                .footer { background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 32px; text-align: center; font-size: 12px; color: #9ca3af; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2 class="brand">BAZ<span>ZAR</span></h2>
                </div>
                <div class="content">
                  <div class="badge">Revisions Required</div>
                  <h1>Hello %s,</h1>
                  <p>Your product listing for <strong>%s</strong> was reviewed by the Super Admin, but needs adjustments before it can go live.</p>
                  
                  <div class="remark-card">
                    <div class="remark-title">Super Admin Rejection Reason:</div>
                    <p class="remark-body">%s</p>
                  </div>

                  <p><strong>Next Step:</strong> You can edit the product info, price, stock, description, or images from your Seller Dashboard and re-submit it for approval.</p>

                  <a href="http://localhost:3000/store-admin/products" class="cta-btn">Edit &amp; Re-Submit Product &rarr;</a>
                </div>
                <div class="footer">
                  &copy; Bazzar Marketplace. Sent to %s.
                </div>
              </div>
            </body>
            </html>
            """.formatted(
                seller.getName(),
                product.getName(),
                reason,
                recipient
        );

        sendEmail(recipient, subject, html);
    }

    /**
     * Sends an email to the customer when their order is placed.
     */
    @Async
    public void sendOrderPlacedEmail(com.bazzar.entity.Order order) {
        String recipient = order.getEmail();
        String subject = "🎉 Order Placed Successfully! #" + order.getId() + " | Bazzar Marketplace";

        StringBuilder itemsHtml = new StringBuilder();
        for (com.bazzar.entity.OrderItem item : order.getItems()) {
            itemsHtml.append("""
                <div class="detail-row" style="padding: 10px 0;">
                  <span class="detail-label" style="color: #111111; font-weight: 600;">%s <span style="color: #6b7280; font-weight: 400;">(x%d)</span></span>
                  <span class="detail-value">₹%s</span>
                </div>
            """.formatted(
                    item.getProduct().getName(),
                    item.getQuantity(),
                    item.getPrice().multiply(java.math.BigDecimal.valueOf(item.getQuantity())).toString()
            ));
        }

        String trackingUrl = "http://localhost:3000/orders/" + order.getId();
        String paymentBadge = "COD".equalsIgnoreCase(order.getPaymentMethod())
                ? "<span style=\"background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 6px; font-weight: 700; font-size: 11px;\">Cash on Delivery</span>"
                : "<span style=\"background: #d1fae5; color: #065f46; padding: 2px 8px; border-radius: 6px; font-weight: 700; font-size: 11px;\">Razorpay Paid</span>";

        String html = """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f7f5; margin: 0; padding: 24px; color: #111111; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e8e8e8; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
                .header { background: #111111; padding: 28px 32px; text-align: center; }
                .brand { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff; margin: 0; }
                .brand span { color: #3f46d8; }
                .content { padding: 36px 32px; }
                .badge { display: inline-block; background: #d1fae5; color: #065f46; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 12px; border-radius: 9999px; letter-spacing: 0.5px; margin-bottom: 16px; border: 1px solid #a7f3d0; }
                h1 { font-size: 22px; font-weight: 800; margin: 0 0 12px; color: #111111; }
                p { font-size: 14px; line-height: 1.6; color: #4b5563; margin: 0 0 16px; }
                .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 14px; padding: 20px; margin: 24px 0; }
                .card-title { font-size: 13px; font-weight: 700; text-transform: uppercase; color: #6b7280; letter-spacing: 0.5px; margin-bottom: 12px; }
                .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
                .detail-row:last-child { border-bottom: none; }
                .detail-label { color: #6b7280; font-weight: 500; }
                .detail-value { color: #111111; font-weight: 600; text-align: right; }
                .total-row { display: flex; justify-content: space-between; padding: 12px 0 0; border-top: 2px solid #e5e7eb; margin-top: 8px; font-size: 16px; font-weight: 800; color: #3f46d8; }
                .cta-btn { display: block; text-align: center; background: #3f46d8; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 14px; margin: 28px 0; }
                .footer { background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 32px; text-align: center; font-size: 12px; color: #9ca3af; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2 class="brand">BAZ<span>ZAR</span></h2>
                </div>
                <div class="content">
                  <div class="badge">Order Confirmed</div>
                  <h1>Thank you for your order, %s!</h1>
                  <p>Your order <strong>#%d</strong> has been confirmed. Our seller is preparing your package for courier pickup and dispatch.</p>
                  
                  <div class="card">
                    <div class="card-title">Order Summary (#%d)</div>
                    %s
                    <div class="total-row">
                      <span>Total Amount:</span>
                      <span>₹%s</span>
                    </div>
                  </div>

                  <div class="card">
                    <div class="card-title">Delivery &amp; Payment</div>
                    <div class="detail-row"><span class="detail-label">Recipient:</span><span class="detail-value">%s (%s)</span></div>
                    <div class="detail-row"><span class="detail-label">Delivery Address:</span><span class="detail-value">%s, %s - %s</span></div>
                    <div class="detail-row"><span class="detail-label">Payment Method:</span><span class="detail-value">%s</span></div>
                  </div>

                  <p>You can track the live location of your parcel from pickup warehouse to your doorstep anytime using our interactive tracking map:</p>

                  <a href="%s" class="cta-btn">Track Your Order Live &rarr;</a>
                </div>
                <div class="footer">
                  &copy; Bazzar Marketplace. Sent to %s.
                </div>
              </div>
            </body>
            </html>
            """.formatted(
                order.getFullName(),
                order.getId(),
                order.getId(),
                itemsHtml.toString(),
                order.getTotalAmount().toString(),
                order.getFullName(),
                order.getPhoneNumber(),
                order.getAddress(),
                order.getCity(),
                order.getPostalCode(),
                paymentBadge,
                trackingUrl,
                recipient
        );

        sendEmail(recipient, subject, html);
    }

    /**
     * Sends an email to the customer when the order status changes (Shipped / Out for Delivery / Delivered).
     */
    @Async
    public void sendOrderStatusUpdateEmail(com.bazzar.entity.Order order, String newStatus) {
        String recipient = order.getEmail();
        String displayStatus = newStatus;
        String badgeColor = "#d1fae5";
        String textColor = "#065f46";
        String statusMessage = "Your order status has been updated.";

        if ("SHIPPED".equalsIgnoreCase(newStatus)) {
            displayStatus = "Shipped & In-Transit 🚚";
            badgeColor = "#fef3c7";
            textColor = "#92400e";
            statusMessage = "Your parcel has been picked up from the seller warehouse and is on its way to your city.";
        } else if ("DELIVERED".equalsIgnoreCase(newStatus)) {
            displayStatus = "Delivered 🎉";
            badgeColor = "#d1fae5";
            textColor = "#065f46";
            statusMessage = "Your package has been safely delivered to your doorstep! We hope you love your purchase.";
        } else if ("CONFIRMED".equalsIgnoreCase(newStatus)) {
            displayStatus = "Confirmed & Manifested 📦";
            badgeColor = "#e0e7ff";
            textColor = "#3730a3";
            statusMessage = "The seller has confirmed your order and scheduled Shiprocket courier pickup.";
        }

        String subject = "🚚 Order #" + order.getId() + " Update: " + displayStatus + " | Bazzar";
        String trackingUrl = "http://localhost:3000/orders/" + order.getId();

        String awbSection = (order.getAwbCode() != null && !order.getAwbCode().isBlank())
                ? "<div class=\"detail-row\"><span class=\"detail-label\">Shiprocket AWB:</span><span class=\"detail-value\" style=\"font-family: monospace;\">" + order.getAwbCode() + " (" + (order.getCourierName() != null ? order.getCourierName() : "Express") + ")</span></div>"
                : "";

        String html = """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f7f5; margin: 0; padding: 24px; color: #111111; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e8e8e8; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
                .header { background: #111111; padding: 28px 32px; text-align: center; }
                .brand { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff; margin: 0; }
                .brand span { color: #3f46d8; }
                .content { padding: 36px 32px; }
                .badge { display: inline-block; background: %s; color: %s; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 12px; border-radius: 9999px; letter-spacing: 0.5px; margin-bottom: 16px; }
                h1 { font-size: 22px; font-weight: 800; margin: 0 0 12px; color: #111111; }
                p { font-size: 14px; line-height: 1.6; color: #4b5563; margin: 0 0 16px; }
                .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 14px; padding: 20px; margin: 24px 0; }
                .card-title { font-size: 13px; font-weight: 700; text-transform: uppercase; color: #6b7280; letter-spacing: 0.5px; margin-bottom: 12px; }
                .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
                .detail-row:last-child { border-bottom: none; }
                .detail-label { color: #6b7280; font-weight: 500; }
                .detail-value { color: #111111; font-weight: 600; text-align: right; }
                .cta-btn { display: block; text-align: center; background: #3f46d8; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 14px; margin: 28px 0; }
                .footer { background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 32px; text-align: center; font-size: 12px; color: #9ca3af; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2 class="brand">BAZ<span>ZAR</span></h2>
                </div>
                <div class="content">
                  <div class="badge">%s</div>
                  <h1>Hello %s,</h1>
                  <p>%s</p>
                  
                  <div class="card">
                    <div class="card-title">Live Tracking Details</div>
                    <div class="detail-row"><span class="detail-label">Order Number:</span><span class="detail-value">#%d</span></div>
                    <div class="detail-row"><span class="detail-label">Current Status:</span><span class="detail-value">%s</span></div>
                    %s
                    <div class="detail-row"><span class="detail-label">Delivery Destination:</span><span class="detail-value">%s, %s</span></div>
                  </div>

                  <a href="%s" class="cta-btn">View Interactive Tracking Map &rarr;</a>
                </div>
                <div class="footer">
                  &copy; Bazzar Marketplace. Sent to %s.
                </div>
              </div>
            </body>
            </html>
            """.formatted(
                badgeColor,
                textColor,
                displayStatus,
                order.getFullName(),
                statusMessage,
                order.getId(),
                displayStatus,
                awbSection,
                order.getCity(),
                order.getPostalCode(),
                trackingUrl,
                recipient
        );

        sendEmail(recipient, subject, html);
    }

    private void sendEmail(String toEmail, String subject, String htmlContent) {
        if (mailSender == null) {
            log.warn("JavaMailSender is not initialized. Skipping email to: {}", toEmail);
            return;
        }

        if (mailUsername == null || mailUsername.trim().isEmpty()) {
            log.warn("MAIL_USERNAME is not configured in environment. Skipping email sending to: {}. Subject: {}", toEmail, subject);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());

            String senderEmail = (fromEmail != null && !fromEmail.isBlank()) ? fromEmail.trim() : mailUsername.trim();
            helper.setFrom(senderEmail, fromName != null ? fromName : "Bazzar Marketplace");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Successfully dispatched email to: {} with subject: {}", toEmail, subject);
        } catch (MessagingException me) {
            log.error("Failed to compose or send email to {}: {}", toEmail, me.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error sending email to {}: {}", toEmail, e.getMessage(), e);
        }
    }

    private String formatPickupAddress(StoreAdminApplication app) {
        StringBuilder sb = new StringBuilder();
        if (app.getPickupAddressLine1() != null) sb.append(app.getPickupAddressLine1());
        if (app.getPickupAddressLine2() != null && !app.getPickupAddressLine2().isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(app.getPickupAddressLine2());
        }
        if (app.getPickupCity() != null && !app.getPickupCity().isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(app.getPickupCity());
        }
        if (app.getPickupState() != null && !app.getPickupState().isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(app.getPickupState());
        }
        if (app.getPickupPostalCode() != null && !app.getPickupPostalCode().isBlank()) {
            if (sb.length() > 0) sb.append(" - ");
            sb.append(app.getPickupPostalCode());
        }
        return sb.length() > 0 ? sb.toString() : "Address on file";
    }
}
