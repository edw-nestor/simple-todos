import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Tasks = new Mongo.Collection('tasks');

if (Meteor.isServer) {
    // This code only runs on the server
    // Only publish tasks that are public or belong to the current user
    Meteor.publish('tasks', function tasksPublication() {
        return Tasks.find({
            $or: [ 
                { private: { $ne: true } },
                { owner: this.userId },
            ],
        });
    });
}

Meteor.methods({
  'tasks.insert'(text) {
    check(text, String);

    // make sure a user is logged in before inserting a tasks
    if(! this.userId) {
      throw new Meteor.Error('not-authorized');
    }    

    Tasks.insert({
      text,
      createdAt: new Date(),
      owner: this.userId,
      username: Meteor.users.findOne(this.userId).username,
    });
  },
  'tasks.remove'(taskId) {
      check(taskId, String);

      Tasks.remove(taskId);
  },
  'tasks.setChecked'(taskId, setChecked) {
      check(taskId, String);
      check(setChecked, Boolean);
      Tasks.update(taskId, { $set: { checked: setChecked } });
  },
  'tasks.setPrivate'(taskId, setToPrivate) {
      check(taskId, String);
      check(seToPrivate, Boolean);

      const task = Tasks.findOne(taskId);

      // Make sure only a task owner can mark a task private
      if (task.owner !== this.userId) {
          throw new Meteor.Error('not-authorized');
      }

      Tasks.update(taskId, { $set: { private: setToPrivate } });
  }
});