// =============================================================================

// =========================== utils/uiMessage.ts ==============================
//> utils/uiMessage.ts

export const uiMessage = (code: string): string => {
    switch (code) {
      case "VERSION_MISMATCH":
        return "Task changed – please reload.";
      case "MAX_CLAIMS_REACHED":
        return "All claim slots are full. Try later.";
      case "TASK_NOT_FOUND":
        return "Task no longer exists.";
      case "TASK_CLOSED":
        return "Task is closed.";
      default:
        return "Unexpected error. Please retry.";
    }
  };
  