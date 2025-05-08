import {io, onlineUsers} from '../socket.js';
const routeMap = {
    projects: 'projects/view',
    tasks: 'projects',
    sprints: 'sprints',
    roles: 'roles',
    auth: 'auth',
    users: 'users',
    groups: 'usergroups',
    documentation: 'documentation',
    qataks: 'qatask',
    maintasks: 'MainTask',
    worklogs: 'WorkLog',
    dailyreports: 'DailyReport'
};
const getLink = (resource, id = null) => {
    const base = routeMap[resource];
    if (!base) return null;
    return id ? `${base}/${id}` : base;
};

function notifyUsers({ message, changes, receivers = [], type, id = null }) {
    console.log('📣 Sending notification to users:', receivers);
    let changedFields = [];
    if(changes){
        changedFields = formatChanges(changes);
    }

    
    const link = getLink(type, id);
    const payload = {
      type,
      message,
      changedFields,
      link,
      timestamp: new Date().toISOString(),
    };
  
    if (receivers.length > 0) {
      receivers.forEach((userId) => {
        const socketId = onlineUsers.get(userId.toString());
        if (socketId) {
          io.to(socketId).emit('send-notification', payload);
          console.log(`✅ Notified user ${userId} via socket ${socketId}`);
        } else {
          console.log(`⚠️ User ${userId} is offline or socket not found`);
        }
      });
    } else {
      // Fallback: emit to everyone if no specific receiver is given
      io.emit('send-notification', payload);
      console.log(`🔄 Broadcasted to all users`);
    }
  }
  const isPlainObject = (val) =>
    val && typeof val === 'object' && !Array.isArray(val);
  
  const isNonEmpty = (val) =>
    val !== null &&
    val !== undefined &&
    !(typeof val === 'string' && val.trim() === '');
  
  const formatChanges = (changesLog) => {
    const messages = [];
  
    changesLog.forEach(({ field, oldValue, newValue }) => {
      if (!isNonEmpty(oldValue) && !isNonEmpty(newValue)) return;
  
      // If both are equal, skip
      if (JSON.stringify(oldValue) === JSON.stringify(newValue)) return;
  
      if (isPlainObject(oldValue) && isPlainObject(newValue)) {
        Object.keys(newValue).forEach((key) => {
          const oldVal = oldValue[key];
          const newVal = newValue[key];
  
          if (
            isNonEmpty(oldVal) &&
            isNonEmpty(newVal) &&
            !isPlainObject(oldVal) &&
            !isPlainObject(newVal) &&
            oldVal !== newVal
          ) {
            if(key === 'status'){

                messages.push(
                    `[[${field}]][[${key}]] changed from '${oldVal}' to '${newVal}'`
                );
            }
          }
        });
      } else if (
        isNonEmpty(oldValue) &&
        isNonEmpty(newValue) &&
        oldValue !== newValue
      ) {
        messages.push(`[[${field}]] changed from '[[${oldValue}]]' to '[[${newValue}]]'`);
      }
    });
  
    return messages;
  };
  
  

export {getLink, notifyUsers}