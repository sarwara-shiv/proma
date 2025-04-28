import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { ChangeLog, Sprint, TaskStatus, TaskPriority, ProjectStatus, ProjectPriority, Task, Project, Documentation, QaTask, MainTask, DailyReport, WorkLog } from '../models/models.js';
import { UserRolesModel } from '../models/userRolesModel.js';
import UserModel from '../models/userModel.js'; 
import UserGroupModel from '../models/userGroupModel.js'; 
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

const getModel = (resource) => {
  switch (resource) {
    case 'projects':
      return Project;
    case 'tasks':
      return Task;
    case 'sprints':
      return Sprint;
    case 'roles':
      return UserRolesModel;
    case 'auth':
      return UserModel;
    case 'users':
      return UserModel;
    case 'groups':
      return UserGroupModel; 
    case 'documentation':
      return Documentation;
    case 'qataks':
      return QaTask;
    case 'maintasks':
      return MainTask;
    case 'worklogs':
      return WorkLog;
    case 'dailyreports':
      return DailyReport;
    default:
      return null;
  }
};

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './images'; // Directory to store images
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir); // Create the directory if it doesn't exist
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext; // Unique filename
    cb(null, filename);
  },
});

const upload = multer({ storage });

// Helper function to handle file uploads
const handleImageUpload = (files) => {
  return files.map((file) => `/images/${file.filename}`);
};

// Helper function to check and delete files
const deleteFile = async (filePath) => {
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    await fs.promises.unlink(filePath);
  } catch (err) {
    throw new Error(`Failed to delete file: ${filePath}`);
  }
};

// Upload single image with icon or multiple images with icons (protected with verifyToken)
router.post(
  '/images-upload',
  upload.fields([{ name: 'normal', maxCount: 10 }, { name: 'icon', maxCount: 10 }]),
  verifyToken,
  async (req, res) => {
    console.log(req.body);
    const { id, page } = req.body;
    console.log('-------', id, page);
    try {
      if (!req.files || !req.files.normal || !req.files.icon) {
        return res.status(400).json({
          status: 'error',
          message: 'Both normal and icon images are required',
          code: 'data_missing',
        });
      }

      let normalImages, iconImages;
      normalImages = handleImageUpload(req.files.normal);
      iconImages = handleImageUpload(req.files.icon);

      if (!normalImages || !iconImages) {
        return res.status(400).json({
          status: 'error',
          message: 'Error processing uploaded files',
          code: 'file_error',
        });
      }

      if (id && page) {
        const model = getModel(page);
        if (!model) {
          return res.status(400).json({ status: 'error', message: 'Model not found', code: 'invalid_resource' });
        }

        const doc = await model.findById(id);
        if (!doc) {
          return res.status(404).json({ status: 'error', message: 'Document not found', code: 'doc_not_found' });
        }

        if (normalImages.length === 1 && iconImages.length === 1) {
          // Single image case
          doc.image = {
            full: normalImages[0],
            icon: iconImages[0]
          };
        } else {
          // Multiple images case
          const imagesArray = normalImages.map((full, idx) => ({
            full,
            icon: iconImages[idx] || ''
          }));
          doc.images = [...(doc.images || []), ...imagesArray];
        }

        await doc.save();
      }

      res.json({
        status: 'success',
        message: 'Files uploaded successfully',
        code: 'data_uploaded',
        data: {
          normalImages,
          iconImages,
        },
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message || 'Error uploading files',
        code: 'data_error',
      });
    }
  }
);


// Delete single or multiple images (protected with verifyToken)
router.delete('/images-delete', verifyToken, async (req, res) => {
  const { id, page, imageNames } = req.body;

  if (!imageNames || !page || !id) {
    return res.status(400).json({
      status: 'error',
      message: 'Image names, page, and id are required',
      code: 'data_missing',
    });
  }

  const imageArray = Array.isArray(imageNames) ? imageNames : [imageNames];

  try {
    const model = getModel(page);
    if (!model) {
      return res.status(400).json({ status: 'error', message: 'Model not found', code: 'invalid_resource' });
    }

    const doc = await model.findById(id);
    if (!doc) {
      return res.status(404).json({ status: 'error', message: 'Document not found', code: 'doc_not_found' });
    }

    // Handle image deletion from document
    if (doc.image && imageArray.includes(path.basename(doc.image.full))) {
      doc.image = { full: '', icon: '' };
    }

    if (doc.images && doc.images.length > 0) {
      doc.images = doc.images.filter(img => {
        const fullName = path.basename(img.full);
        const iconName = path.basename(img.icon);
        return !imageArray.includes(fullName) && !imageArray.includes(iconName);
      });
    }

    await doc.save();

    // Delete files from disk
    for (const imageName of imageArray) {
      const filePath = path.join('images', imageName);
      await deleteFile(filePath);
    }

    res.status(200).json({
      status: 'success',
      message: 'Images deleted successfully',
      code: 'data_deleted',
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message || 'Error deleting image(s)',
      code: 'data_not_found',
    });
  }
});


export { router as filesRouter };
