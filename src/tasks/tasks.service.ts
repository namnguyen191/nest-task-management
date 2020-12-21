import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';
import { TaskRepository } from './task.repository';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskRepository) private taskRepository: TaskRepository,
  ) {}

  async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    return this.taskRepository.getTask(filterDto, user);
  }

  async getTaskById(id: number, user: User): Promise<Task> {
    const found = await this.taskRepository.findOne({
      where: { id, userId: user.id },
    });

    if (!found) {
      throw new NotFoundException(`Task with id: ${id} cannot be found!`);
    }

    return found;
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    return this.taskRepository.createTask(createTaskDto, user);
  }

  async deleteTaskById(id: number, user: User): Promise<void> {
    const deletedItem = await this.taskRepository.delete({
      id,
      userId: user.id,
    });

    // If nothing is deleted
    if (deletedItem.affected === 0) {
      throw new NotFoundException(`Task with id: ${id} cannot be found!`);
    }
  }

  async updateTaskStatusById(
    id: number,
    newStatus: TaskStatus,
    user: User,
  ): Promise<{ old: Task; new: Task }> {
    const task = await this.taskRepository.findOne({
      where: { id, userId: user.id },
    });

    if (!task) {
      throw new NotFoundException(`Task with id: ${id} cannot be found!`);
    }

    const oldTask = Object.assign({}, task);

    task.status = newStatus;
    task.save();

    return {
      old: oldTask,
      new: task,
    };
  }
}
