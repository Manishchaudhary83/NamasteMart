import mongoose, { Schema } from 'mongoose';

const AuditLogSchema = new Schema({
  actionType: { type: String, required: true },
  performedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  targetCollection: { type: String },
  previousData: { type: Schema.Types.Mixed },
  newData: { type: Schema.Types.Mixed },
  ipAddress: { type: String },
  timestamp: { type: Date, default: Date.now }
});

export const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
