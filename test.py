import heapq
import random
import matplotlib.pyplot as plt
import time
# Grid Dimensions
grid_size = (10, 10)  # 10x10 grid

# Symbols
EMPTY = "."
OBSTACLE = "#"
ROBOT = "R"
TASK = "T"

# Initialize Grid
def create_grid():
    grid = [[EMPTY for _ in range(grid_size[1])] for _ in range(grid_size[0])]
    
    # Place Obstacles
    for _ in range(15):
        x, y = random.randint(0, 9), random.randint(0, 9)
        grid[x][y] = OBSTACLE

    return grid

# A* Algorithm for Pathfinding
class AStar:
    def __init__(self, grid):
        self.grid = grid
        self.rows = len(grid)
        self.cols = len(grid[0])

    def heuristic(self, current, goal):
        return abs(current[0] - goal[0]) + abs(current[1] - goal[1])

    def neighbors(self, node):
        x, y = node
        directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]  # Right, Down, Left, Up
        result = []
        for dx, dy in directions:
            nx, ny = x + dx, y + dy
            if 0 <= nx < self.rows and 0 <= ny < self.cols and self.grid[nx][ny] != OBSTACLE:
                result.append((nx, ny))
        return result

    def find_path(self, start, goal):
        open_set = []
        heapq.heappush(open_set, (0, start))
        came_from = {}
        g_score = {start: 0}
        f_score = {start: self.heuristic(start, goal)}

        while open_set:
            _, current = heapq.heappop(open_set)

            if current == goal:
                path = []
                while current in came_from:
                    path.append(current)
                    current = came_from[current]
                return path[::-1]  # Reverse path

            for neighbor in self.neighbors(current):
                tentative_g_score = g_score[current] + 1

                if tentative_g_score < g_score.get(neighbor, float('inf')):
                    came_from[neighbor] = current
                    g_score[neighbor] = tentative_g_score
                    f_score[neighbor] = tentative_g_score + self.heuristic(neighbor, goal)
                    heapq.heappush(open_set, (f_score[neighbor], neighbor))

        return None  # No path found

# Robot Class
class Robot:
    def __init__(self, id, position):
        self.id = id
        self.position = position
        self.state = "idle"  # States: idle, moving, delivering
        self.task = None

    def assign_task(self, task_position):
        self.task = task_position
        self.state = "moving"

    def move(self, path):
        if path:
            self.position = path.pop(0)
        else:
            self.state = "delivering"

# Task Generator
def generate_tasks(grid, num_tasks):
    tasks = []
    for _ in range(num_tasks):
        while True:
            x, y = random.randint(0, 9), random.randint(0, 9)
            if grid[x][y] == EMPTY:
                grid[x][y] = TASK
                tasks.append((x, y))
                break
    return tasks

# Visualize Grid
def display_grid(grid, robots):
    grid_copy = [row[:] for row in grid]

    for robot in robots:
        x, y = robot.position
        grid_copy[x][y] = ROBOT

    for row in grid_copy:
        print(" ".join(row))
    print("\n")

# Simulation
def simulate():
    grid = create_grid()
    robots = [Robot(i, (random.randint(0, 9), random.randint(0, 9))) for i in range(3)]
    tasks = generate_tasks(grid, 5)
    
    astar = AStar(grid)

    while tasks:
        for robot in robots:
            if robot.state == "idle" and tasks:
                task = tasks.pop(0)
                robot.assign_task(task)
                robot.path = astar.find_path(robot.position, task)

            if robot.state == "moving":
                robot.move(robot.path)

            if robot.state == "delivering":
                robot.state = "idle"

        display_grid(grid, robots)
        time.sleep(1)

if __name__ == "__main__":
    simulate()
