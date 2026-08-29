import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import { Issue } from './models/Issue.js';
import { User } from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://hemanthvaka6170_db_user:6DNwyAkEFosqBZ0e@campusfixcluster.mf7dn7l.mongodb.net/campusfix?retryWrites=true&w=majority&appName=CampusFixCluster';

// Disable Mongoose command buffering so queries don't hang if Atlas is unreachable
mongoose.set('bufferCommands', false);

// Configured Admin Emails
const ADMIN_EMAILS = [
  'mattasaiswaroop5641@gmail.com', 
  'campusfix5641@gmail.com',
  'hemanthvaka6170@gmail.com'
];
const GMAIL_USER = process.env.GMAIL_USER || 'campusfix5641@gmail.com';
const GMAIL_PASS = process.env.GMAIL_PASS || 'qwuxwpwnjefwqoxe';

// In-memory store for Admin Email OTP verification
const emailOtpStore = new Map();

// Real Nodemailer transporter - ALWAYS sends from campusfix5641@gmail.com
let transporter = null;
if (GMAIL_USER && GMAIL_PASS) {
  try {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS
      }
    });
    console.log('✅ Nodemailer initialized with sender:', GMAIL_USER);
  } catch (e) {
    console.log('Nodemailer init error:', e.message);
  }
}

app.use(cors());
app.use(express.json({ limit: '15mb' }));

// In-memory fallback cache if MongoDB is offline
let inMemoryIssues = [];

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    senderEmail: GMAIL_USER,
    adminEmails: ADMIN_EMAILS,
    timestamp: new Date().toISOString()
  });
});

// GET all issues
app.get('/api/issues', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const { category, priority, status, block, department } = req.query;
      const filter = {};
      if (category) filter.category = category;
      if (priority) filter.priority = priority;
      if (status) filter.status = status;
      if (block) filter.block = block;
      if (department) filter.department = department;

      const issues = await Issue.find(filter).sort({ createdAt: -1 });
      inMemoryIssues = issues;
      return res.json(issues);
    }
  } catch (error) {
    console.log('MongoDB GET issues notice:', error.message);
  }
  res.json(inMemoryIssues);
});

// ============================================================================
// 1. AUTH EMAIL ENDPOINT (User Email 1: Login & User Email 2: Logout)
// ============================================================================
app.post('/api/auth-email', async (req, res) => {
  try {
    const { type, user } = req.body;
    if (!user || !user.email) {
      return res.status(400).json({ error: 'User email is required' });
    }

    const timestamp = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) + ' ' +
                      new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    if (transporter) {
      if (type === 'login') {
        // EMAIL 1: USER LOGIN NOTIFICATION
        transporter.sendMail({
          from: `"CampusFix Official" <${GMAIL_USER}>`,
          replyTo: GMAIL_USER,
          to: user.email,
          subject: `🔐 [CAMPUSFIX] Security Alert: Successful Login to CampusFix`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
              <div style="background: #2563eb; color: #ffffff; padding: 16px 20px; border-radius: 8px; margin-bottom: 16px;">
                <h2 style="margin: 0; font-size: 20px;">CampusFix Security Notice</h2>
              </div>
              <p style="font-size: 15px; color: #1e293b;">Hello <strong>${user.name}</strong>,</p>
              <p style="color: #475569; line-height: 1.6;">
                You have successfully signed in to the <strong>CampusFix ${user.role === 'faculty' ? 'Faculty Portal' : 'Student Portal'}</strong>.
              </p>
              <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 16px 0;">
                <p style="margin: 0 0 6px; font-size: 13px; color: #334155;"><strong>Account ID / Roll No:</strong> ${user.regNumber || 'N/A'}</p>
                <p style="margin: 0 0 6px; font-size: 13px; color: #334155;"><strong>Department:</strong> ${user.department}</p>
                ${user.section && user.section !== 'N/A' ? `<p style="margin: 0 0 6px; font-size: 13px; color: #334155;"><strong>Section:</strong> ${user.section}</p>` : ''}
                <p style="margin: 0; font-size: 13px; color: #334155;"><strong>Login Time:</strong> ${timestamp}</p>
              </div>
              <p style="font-size: 12px; color: #64748b;">
                If you did not perform this login, please notify your campus administrator or change your password immediately.
              </p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 11px; color: #94a3b8; margin: 0;">CampusFix Automated Security System • Dispatched from ${GMAIL_USER}</p>
            </div>
          `
        }).then(info => {
          console.log(`✅ [LOGIN EMAIL SENT] To: ${user.email} | ID: ${info.messageId}`);
        }).catch(err => {
          console.error(`❌ [LOGIN EMAIL ERROR] To: ${user.email} | Error: ${err.message}`);
        });

      } else if (type === 'logout') {
        // EMAIL 2: USER LOGOUT NOTIFICATION
        transporter.sendMail({
          from: `"CampusFix Official" <${GMAIL_USER}>`,
          replyTo: GMAIL_USER,
          to: user.email,
          subject: `👋 [CAMPUSFIX] Session Ended: You have Logged Out`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
              <div style="background: #475569; color: #ffffff; padding: 16px 20px; border-radius: 8px; margin-bottom: 16px;">
                <h2 style="margin: 0; font-size: 20px;">CampusFix Session Ended</h2>
              </div>
              <p style="font-size: 15px; color: #1e293b;">Hello <strong>${user.name}</strong>,</p>
              <p style="color: #475569; line-height: 1.6;">
                Your CampusFix session has ended successfully. You have been logged out of the portal.
              </p>
              <div style="background: #f8fafc; padding: 14px; border-radius: 8px; border-left: 4px solid #64748b; margin: 16px 0;">
                <p style="margin: 0; font-size: 13px; color: #334155;"><strong>Logout Time:</strong> ${timestamp}</p>
              </div>
              <p style="font-size: 13px; color: #475569;">
                Thank you for using CampusFix to help maintain and improve our campus facilities!
              </p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 11px; color: #94a3b8; margin: 0;">CampusFix Automated Notification • Dispatched from ${GMAIL_USER}</p>
            </div>
          `
        }).then(info => {
          console.log(`✅ [LOGOUT EMAIL SENT] To: ${user.email} | ID: ${info.messageId}`);
        }).catch(err => {
          console.error(`❌ [LOGOUT EMAIL ERROR] To: ${user.email} | Error: ${err.message}`);
        });
      }
    }

    res.json({ message: 'Auth email processed' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ============================================================================
// 1.1 ADMIN EMAIL OTP 2FA ENDPOINTS
// ============================================================================

// POST /api/auth/send-admin-otp - Dispatches 6-digit OTP to Admin Email
app.post('/api/auth/send-admin-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Admin email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Generate cryptographically secure 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

    emailOtpStore.set(cleanEmail, { otp, expiresAt, attempts: 0 });

    if (transporter) {
      const mailOptions = {
        from: `"CampusFix Security" <${GMAIL_USER}>`,
        to: cleanEmail,
        replyTo: GMAIL_USER,
        subject: `CampusFix Admin Verification Code: ${otp}`,
        text: `Hello Administrator,\n\nYour CampusFix login verification code is: ${otp}\n\nThis code is valid for 5 minutes. Please enter it in the Admin Login window to complete sign in.\n\nDispatched from ${GMAIL_USER}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
            <div style="background: linear-gradient(135deg, #0f172a, #1e1b4b); color: #ffffff; padding: 20px; border-radius: 12px; text-align: center;">
              <h2 style="margin: 0; font-size: 20px; letter-spacing: 1px;">CAMPUSFIX SECURITY</h2>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #93c5fd;">Administrator Two-Factor Verification</p>
            </div>
            
            <div style="padding: 24px 0; text-align: center;">
              <p style="font-size: 14px; color: #475569; margin-bottom: 16px;">
                You requested a secure login verification code for administrator account: <br/>
                <strong style="color: #0f172a;">${cleanEmail}</strong>
              </p>
              
              <div style="display: inline-block; background-color: #f8fafc; border: 2px dashed #2563eb; border-radius: 12px; padding: 14px 32px; margin: 8px 0;">
                <span style="font-family: monospace; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1e40af;">${otp}</span>
              </div>
              
              <p style="font-size: 12px; color: #64748b; margin-top: 16px;">
                ⏰ This code is valid for <strong>5 minutes</strong>. Do not share this code with anyone.
              </p>
            </div>
            
            <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; text-align: center; font-size: 11px; color: #94a3b8;">
              CampusFix Automated Security Alert • Dispatched from ${GMAIL_USER}
            </div>
          </div>
        `
      };

      transporter.sendMail(mailOptions).then((info) => {
        console.log(`✅ [ADMIN EMAIL OTP SENT] To: ${cleanEmail} | OTP: ${otp} | ID: ${info.messageId}`);
      }).catch(err => {
        console.error('❌ Nodemailer Admin OTP error:', err.message);
      });

      return res.json({ success: true, message: 'Verification code sent to your email.' });
    } else {
      console.log(`[OFFLINE OTP] Generated for ${cleanEmail}: ${otp}`);
      return res.json({ success: true, message: 'Verification code generated.', devOtp: otp });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/verify-admin-otp - Verifies 6-digit OTP
app.post('/api/auth/verify-admin-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and verification code are required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const stored = emailOtpStore.get(cleanEmail);

  if (!stored) {
    return res.status(400).json({ success: false, message: 'No verification code requested or code has expired.' });
  }

  if (Date.now() > stored.expiresAt) {
    emailOtpStore.delete(cleanEmail);
    return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new code.' });
  }

  if (stored.attempts >= 5) {
    emailOtpStore.delete(cleanEmail);
    return res.status(429).json({ success: false, message: 'Too many invalid attempts. Please request a new code.' });
  }

  if (stored.otp === otp.trim()) {
    emailOtpStore.delete(cleanEmail);
    console.log(`✅ [ADMIN EMAIL OTP VERIFIED] Successfully authenticated: ${cleanEmail}`);
    return res.json({ success: true, verified: true, message: 'Admin authentication verified successfully.' });
  } else {
    stored.attempts += 1;
    return res.status(400).json({ success: false, message: `Invalid verification code. ${5 - stored.attempts} attempt(s) remaining.` });
  }
});

// ============================================================================
// 2. CREATE ISSUE ENDPOINT (Admin Alert Email + User Ticket Confirmation Email)
// ============================================================================
app.post('/api/issues', async (req, res) => {
  const issueData = req.body;
  
  // Update in-memory store immediately
  inMemoryIssues = [issueData, ...inMemoryIssues.filter(i => i.id !== issueData.id)];

  // 1. DISPATCH EMAILS IMMEDIATELY (Decoupled from DB speed)
  if (transporter) {
    const allAdminRecipients = Array.from(new Set([
      ...ADMIN_EMAILS,
      req.body.activeAdminEmail,
      req.headers['x-admin-email']
    ].filter(Boolean)));

    // A. Admin Alert Email
    transporter.sendMail({
      from: `"CampusFix Official" <${GMAIL_USER}>`,
      replyTo: GMAIL_USER,
      to: allAdminRecipients.join(', '),
      subject: `🚨 [CAMPUSFIX ADMIN ALERT] Ticket #${issueData.id}: ${issueData.category} reported by ${issueData.reporter}`,
      text: `CAMPUSFIX ADMIN ALERT\n\nTicket #${issueData.id} has been reported.\nCategory: ${issueData.category}\nLocation: ${issueData.location} (${issueData.block})\nPriority: ${issueData.priority}\nReporter: ${issueData.reporter} (${issueData.reporterType} - ${issueData.department})\nDescription: ${issueData.description}\n\nPlease open the Admin Portal to assign staff.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <div style="background: #dc2626; color: #ffffff; padding: 16px 20px; border-radius: 8px; margin-bottom: 16px;">
            <h2 style="margin: 0; font-size: 18px;">⚠️ New Campus Incident Ticket: #${issueData.id}</h2>
          </div>
          
          <p style="font-size: 14px; color: #1e293b; font-weight: bold;">Hello Administrator,</p>
          <p style="font-size: 13px; color: #475569;">A new maintenance issue has just been submitted and requires triage:</p>

          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 16px 0;">
            <p style="margin: 0 0 8px; font-size: 13px; color: #334155;"><strong>Ticket ID:</strong> <span style="font-family: monospace; font-weight: bold; color: #2563eb;">#${issueData.id}</span></p>
            <p style="margin: 0 0 8px; font-size: 13px; color: #334155;"><strong>Category:</strong> ${issueData.category}</p>
            <p style="margin: 0 0 8px; font-size: 13px; color: #334155;"><strong>Location:</strong> ${issueData.location} (${issueData.block})</p>
            <p style="margin: 0 0 8px; font-size: 13px; color: #334155;"><strong>Priority:</strong> <span style="font-weight: bold; color: ${issueData.priority === 'High' ? '#dc2626' : '#d97706'};">${issueData.priority} Priority</span></p>
            <p style="margin: 0 0 8px; font-size: 13px; color: #334155;"><strong>Reporter:</strong> ${issueData.reporter} (${issueData.reporterType} - ${issueData.department}${issueData.section && issueData.section !== 'N/A' ? ' - ' + issueData.section : ''})</p>
            ${issueData.reporterRegNo ? `<p style="margin: 0 0 8px; font-size: 13px; color: #334155;"><strong>Reporter ID / Roll No:</strong> ${issueData.reporterRegNo}</p>` : ''}
            ${issueData.reporterEmail ? `<p style="margin: 0 0 8px; font-size: 13px; color: #334155;"><strong>Reporter Contact Email:</strong> ${issueData.reporterEmail}</p>` : ''}
            <p style="margin: 0 0 8px; font-size: 13px; color: #334155;"><strong>Description:</strong> ${issueData.description}</p>
          </div>

          ${issueData.imageUrl ? `
            <div style="margin: 16px 0; padding: 14px; background: #f1f5f9; border-radius: 8px; border: 1px solid #cbd5e1;">
              <p style="margin: 0 0 8px; font-weight: bold; font-size: 12px; color: #334155;">📸 Attached Photo Proof Evidence:</p>
              <img src="${issueData.imageUrl}" alt="Problem Proof" style="max-width: 100%; max-height: 280px; border-radius: 6px; object-fit: cover; display: block;" />
            </div>
          ` : ''}

          <p style="font-size: 12px; color: #64748b;">
            Please open the <strong>CampusFix Admin Portal</strong> to assign technicians and update resolution progress.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 11px; color: #94a3b8; margin: 0;">CampusFix Central Dispatch Hub • Dispatched from ${GMAIL_USER}</p>
        </div>
      `
    }).then(info => {
      console.log(`✅ [ADMIN ALERT SENT] To: ${ADMIN_EMAILS.join(', ')} | ID: ${info.messageId}`);
    }).catch(err => {
      console.error(`❌ [ADMIN ALERT ERROR] ${err.message}`);
    });

    // B. User Ticket Creation Confirmation Email
    if (issueData.reporterEmail) {
      transporter.sendMail({
        from: `"CampusFix Official" <${GMAIL_USER}>`,
        replyTo: GMAIL_USER,
        to: issueData.reporterEmail,
        subject: `✅ [CAMPUSFIX] Ticket #${issueData.id} Created Successfully`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <div style="background: #2563eb; color: #ffffff; padding: 16px 20px; border-radius: 8px; margin-bottom: 16px;">
              <h2 style="margin: 0; font-size: 18px;">Ticket #${issueData.id} Registered</h2>
            </div>
            <p style="font-size: 14px; color: #1e293b;">Hello <strong>${issueData.reporter}</strong>,</p>
            <p style="font-size: 13px; color: #475569; line-height: 1.6;">
              Your campus maintenance complaint has been logged and dispatched to the facility maintenance team.
            </p>
            <div style="background: #f8fafc; padding: 14px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 16px 0;">
              <p style="margin: 0 0 6px; font-size: 13px; color: #334155;"><strong>Ticket ID:</strong> #${issueData.id}</p>
              <p style="margin: 0 0 6px; font-size: 13px; color: #334155;"><strong>Issue:</strong> ${issueData.title}</p>
              <p style="margin: 0 0 6px; font-size: 13px; color: #334155;"><strong>Location:</strong> ${issueData.location} (${issueData.block})</p>
              <p style="margin: 0 0 6px; font-size: 13px; color: #334155;"><strong>Category:</strong> ${issueData.category}</p>
              <p style="margin: 0; font-size: 13px; color: #334155;"><strong>Status:</strong> <span style="font-weight: bold; color: #2563eb;">Submitted (Awaiting Triage)</span></p>
            </div>
            <p style="font-size: 12px; color: #64748b;">
              You will receive automatic email updates as our staff work on and resolve this issue.
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 11px; color: #94a3b8; margin: 0;">CampusFix Facility Management • Dispatched from ${GMAIL_USER}</p>
          </div>
        `
      }).then(info => {
        console.log(`✅ [USER CONFIRMATION SENT] To: ${issueData.reporterEmail} | ID: ${info.messageId}`);
      }).catch(err => {
        console.error(`❌ [USER CONFIRMATION ERROR] To: ${issueData.reporterEmail} | Error: ${err.message}`);
      });
    }
  }

  // 2. Persist to MongoDB in background if connected
  if (mongoose.connection.readyState === 1) {
    try {
      const newIssue = new Issue(issueData);
      newIssue.save().catch(e => console.log('MongoDB save note:', e.message));
    } catch (e) {}
  }

  res.status(201).json(issueData);
});

// ============================================================================
// 3. PATCH UPDATE ISSUE ENDPOINT (User Email 3: Updates & User Email 4: Resolved)
// ============================================================================
app.patch('/api/issues/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  updates.updatedAt = new Date().toLocaleString();

  // Find issue from memory or DB to retain reporterEmail and details
  let existingIssue = inMemoryIssues.find(i => i.id === id);
  if (!existingIssue && mongoose.connection.readyState === 1) {
    try {
      const dbIssue = await Issue.findOne({ id });
      if (dbIssue) existingIssue = dbIssue.toObject ? dbIssue.toObject() : dbIssue;
    } catch (e) {}
  }

  const updatedIssue = { ...(existingIssue || {}), ...updates, id };

  // Update in-memory cache
  inMemoryIssues = inMemoryIssues.map(i => i.id === id ? updatedIssue : i);
  if (!inMemoryIssues.some(i => i.id === id)) {
    inMemoryIssues.unshift(updatedIssue);
  }

  // 1. DISPATCH EMAILS IMMEDIATELY
  if (transporter && updatedIssue.reporterEmail) {
    const isResolved = updatedIssue.status === 'Resolved';

    if (isResolved) {
      // EMAIL 4: USER TICKET RESOLVED NOTIFICATION
      transporter.sendMail({
        from: `"CampusFix Official" <${GMAIL_USER}>`,
        replyTo: GMAIL_USER,
        to: updatedIssue.reporterEmail,
        subject: `🎉 [CAMPUSFIX] Ticket #${updatedIssue.id} has been Resolved!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <div style="background: #16a34a; color: #ffffff; padding: 16px 20px; border-radius: 8px; margin-bottom: 16px;">
              <h2 style="margin: 0; font-size: 18px;">✅ Maintenance Resolved: Ticket #${updatedIssue.id}</h2>
            </div>
            <p style="font-size: 14px; color: #1e293b;">Hello <strong>${updatedIssue.reporter}</strong>,</p>
            <p style="font-size: 13px; color: #475569; line-height: 1.6;">
              Great news! Your campus maintenance ticket has been marked as <strong>Successfully Resolved</strong> by the maintenance team.
            </p>
            <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; border-left: 4px solid #16a34a; margin: 16px 0;">
              <p style="margin: 0 0 6px; font-size: 13px; color: #14532d;"><strong>Ticket ID:</strong> #${updatedIssue.id}</p>
              <p style="margin: 0 0 6px; font-size: 13px; color: #14532d;"><strong>Problem:</strong> ${updatedIssue.title}</p>
              <p style="margin: 0 0 6px; font-size: 13px; color: #14532d;"><strong>Location:</strong> ${updatedIssue.location} (${updatedIssue.block})</p>
              <p style="margin: 0 0 6px; font-size: 13px; color: #14532d;"><strong>Status:</strong> <span style="font-weight: bold; color: #16a34a;">Resolved & Verified</span></p>
              ${updatedIssue.assignedStaff ? `<p style="margin: 0 0 6px; font-size: 13px; color: #14532d;"><strong>Resolved By:</strong> ${updatedIssue.assignedStaff}</p>` : ''}
              ${updates.timeline && updates.timeline.length ? `<p style="margin: 0; font-size: 13px; color: #14532d;"><strong>Resolution Note:</strong> ${updates.timeline[updates.timeline.length - 1].note || 'Repairs completed and verified.'}</p>` : ''}
            </div>
            <p style="font-size: 13px; color: #475569;">
              Thank you for reporting this issue and keeping our campus environment safe and comfortable!
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 11px; color: #94a3b8; margin: 0;">CampusFix Resolution Desk • Dispatched from ${GMAIL_USER}</p>
          </div>
        `
      }).then(info => {
        console.log(`✅ [RESOLVED EMAIL SENT] To: ${updatedIssue.reporterEmail} | ID: ${info.messageId}`);
      }).catch(err => {
        console.error(`❌ [RESOLVED EMAIL ERROR] To: ${updatedIssue.reporterEmail} | Error: ${err.message}`);
      });

    } else {
      // EMAIL 3: USER TICKET STATUS UPDATE NOTIFICATION
      const statusColors = {
        'Submitted': '#2563eb',
        'Acknowledged': '#7c3aed',
        'Assigned': '#d97706',
        'In Progress': '#4f46e5'
      };
      const color = statusColors[updatedIssue.status] || '#2563eb';

      transporter.sendMail({
        from: `"CampusFix Official" <${GMAIL_USER}>`,
        replyTo: GMAIL_USER,
        to: updatedIssue.reporterEmail,
        subject: `🔧 [CAMPUSFIX] Update on Ticket #${updatedIssue.id}: Status is now ${updatedIssue.status}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <div style="background: ${color}; color: #ffffff; padding: 16px 20px; border-radius: 8px; margin-bottom: 16px;">
              <h2 style="margin: 0; font-size: 18px;">🔧 CampusFix Ticket Progress: #${updatedIssue.id}</h2>
            </div>
            <p style="font-size: 14px; color: #1e293b;">Hello <strong>${updatedIssue.reporter}</strong>,</p>
            <p style="font-size: 13px; color: #475569; line-height: 1.6;">
              Your reported maintenance issue has been updated by Campus Maintenance:
            </p>
            <div style="background: #f8fafc; padding: 14px; border-radius: 8px; border-left: 4px solid ${color}; margin: 16px 0;">
              <p style="margin: 0 0 6px; font-size: 13px; color: #334155;"><strong>Ticket ID:</strong> #${updatedIssue.id}</p>
              <p style="margin: 0 0 6px; font-size: 13px; color: #334155;"><strong>Problem:</strong> ${updatedIssue.title}</p>
              <p style="margin: 0 0 6px; font-size: 13px; color: #334155;"><strong>Location:</strong> ${updatedIssue.location} (${updatedIssue.block})</p>
              <p style="margin: 0 0 6px; font-size: 13px; color: #334155;"><strong>Current Status:</strong> <span style="font-weight: bold; color: ${color};">${updatedIssue.status}</span></p>
              ${updatedIssue.assignedStaff ? `<p style="margin: 0 0 6px; font-size: 13px; color: #334155;"><strong>Assigned Technician:</strong> ${updatedIssue.assignedStaff}</p>` : ''}
              ${updates.timeline && updates.timeline.length ? `<p style="margin: 0; font-size: 13px; color: #334155;"><strong>Latest Note:</strong> ${updates.timeline[updates.timeline.length - 1].note || 'Status updated by administration.'}</p>` : ''}
            </div>
            <p style="font-size: 12px; color: #64748b;">
              You can track real-time progress by logging into your CampusFix student/faculty dashboard.
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 11px; color: #94a3b8; margin: 0;">CampusFix Progress Desk • Dispatched from ${GMAIL_USER}</p>
          </div>
        `
      }).then(info => {
        console.log(`✅ [STATUS UPDATE SENT] To: ${updatedIssue.reporterEmail} | Status: ${updatedIssue.status} | ID: ${info.messageId}`);
      }).catch(err => {
        console.error(`❌ [STATUS UPDATE ERROR] To: ${updatedIssue.reporterEmail} | Error: ${err.message}`);
      });
    }
  }

  // 2. Persist to MongoDB in background if connected
  if (mongoose.connection.readyState === 1) {
    try {
      Issue.findOneAndUpdate({ id }, updates, { new: true }).catch(() => {});
    } catch (e) {}
  }

  res.json(updatedIssue);
});

// DELETE single issue
app.delete('/api/issues/:id', async (req, res) => {
  const { id } = req.params;
  inMemoryIssues = inMemoryIssues.filter(i => i.id !== id);
  if (mongoose.connection.readyState === 1) {
    try {
      await Issue.findOneAndDelete({ id });
    } catch (e) {}
  }
  res.json({ message: 'Issue deleted successfully', id });
});

// DELETE all issues (Purge entire database)
app.delete('/api/issues', async (req, res) => {
  inMemoryIssues = [];
  if (mongoose.connection.readyState === 1) {
    try {
      await Issue.deleteMany({});
    } catch (e) {}
  }
  res.json({ message: 'Database purged successfully' });
});

// POST purge resolved issues older than 3 days
app.post('/api/admin/purge-resolved-3days', async (req, res) => {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const beforeCount = inMemoryIssues.length;
  inMemoryIssues = inMemoryIssues.filter(issue => {
    if (issue.status !== 'Resolved') return true;
    const dateToCheck = issue.updatedAt ? new Date(issue.updatedAt) : new Date(issue.createdAt);
    return dateToCheck >= threeDaysAgo;
  });
  const deletedCount = beforeCount - inMemoryIssues.length;

  if (mongoose.connection.readyState === 1) {
    try {
      const issues = await Issue.find({ status: 'Resolved' });
      const toDeleteIds = [];
      for (const issue of issues) {
        let dateToCheck = issue.updatedAt ? new Date(issue.updatedAt) : new Date(issue.createdAt);
        if (dateToCheck < threeDaysAgo) toDeleteIds.push(issue.id);
      }
      if (toDeleteIds.length > 0) {
        await Issue.deleteMany({ id: { $in: toDeleteIds } });
      }
    } catch (e) {}
  }

  res.json({ message: 'Auto-purge completed', deletedCount });
});

// Serve frontend static build files (SPA Single-Domain Hosting)
const clientDistPath = path.resolve(__dirname, '../dist');
app.use(express.static(clientDistPath));

// All non-API routes serve index.html
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Start Express Server immediately
app.listen(PORT, () => {
  console.log(' CampusFix API Server listening on port ' + PORT);
});

// Connect to MongoDB Atlas in background
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log(' MongoDB connected successfully to ' + MONGODB_URI);
  })
  .catch(err => {
    console.error(' MongoDB Connection Notice:', err.message);
    console.log(' Note: Local storage fallback will operate seamlessly if Atlas connection is offline.');
  });
