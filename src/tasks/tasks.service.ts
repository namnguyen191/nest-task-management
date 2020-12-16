import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

  async getTasks(filterDto: GetTasksFilterDto): Promise<Task[]> {
    return this.taskRepository.getTask(filterDto);
  }

  async getTaskById(id: number): Promise<Task> {
    const found = await this.taskRepository.findOne(id);

    if (!found) {
      throw new NotFoundException(`Task with id: ${id} cannot be found!`);
    }

    return found;
  }

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    return this.taskRepository.createTask(createTaskDto);
  }

  async deleteTaskById(id: number): Promise<void> {
    const deletedItem = await this.taskRepository.delete(id);

    // If nothing is deleted
    if (deletedItem.affected === 0) {
      throw new NotFoundException(`Task with id: ${id} cannot be found!`);
    }
  }

  async updateTaskStatusById(
    id: number,
    newStatus: TaskStatus,
  ): Promise<{ old: Task; new: Task }> {
    const task = await this.taskRepository.findOne(id);

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
