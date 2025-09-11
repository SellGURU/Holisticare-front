export interface Tasks {
  activities: {
    Times: string[];
    Title: string;
    Category: string;
    Sections: TasksSections[];
    Task_Type: string;
    Description: string;
    Instruction: string;
    Activity_Filters: {
      Type: string[];
      Level: string[];
      Terms: string[];
      Muscle: string[];
      Equipment: string[];
      Conditions: string[];
    };
    Activity_Location: string[];
  };
  encoded_mi: string;
}

export interface TasksSections {
  Sets: number;
  Type: string;
  Section: string;
  Exercises: Exercise[];
}

export interface Exercise {
  Reps: string;
  Rest: string;
  Files: {
    Type: string;
    Title: string;
    Content: {
      url: string;
      file_id: string;
    };
  }[];
  Title: string;
  Weight: string;
  Base_Score: number;
  Description: string;
  task_id: string;
  Instruction: string;
  Exercise_Filters: {
    Type: string;
    Level: string;
    Terms: string;
    Muscle: string;
    Equipment: string;
    Conditions: string;
  };
  Exercise_Location: string[];
  Status: boolean;
}
