/**
 * Набор градиентов для использования в компонентах
 */

// Основные градиенты для карточек
export const cardGradients = {
  // Синие градиенты
  blue: {
    light: "linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.1) 100%)",
    medium: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.2) 100%)",
    strong: "linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.3) 100%)"
  },
  
  // Зеленые градиенты
  green: {
    light: "linear-gradient(135deg, rgba(52, 211, 153, 0.05) 0%, rgba(16, 185, 129, 0.1) 100%)",
    medium: "linear-gradient(135deg, rgba(52, 211, 153, 0.1) 0%, rgba(16, 185, 129, 0.2) 100%)",
    strong: "linear-gradient(135deg, rgba(52, 211, 153, 0.2) 0%, rgba(16, 185, 129, 0.3) 100%)"
  },
  
  // Красные градиенты
  red: {
    light: "linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(153, 27, 27, 0.1) 100%)",
    medium: "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(153, 27, 27, 0.2) 100%)",
    strong: "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(153, 27, 27, 0.3) 100%)"
  },
  
  // Желтые градиенты
  yellow: {
    light: "linear-gradient(135deg, rgba(234, 179, 8, 0.05) 0%, rgba(161, 98, 7, 0.1) 100%)",
    medium: "linear-gradient(135deg, rgba(234, 179, 8, 0.1) 0%, rgba(161, 98, 7, 0.2) 100%)",
    strong: "linear-gradient(135deg, rgba(234, 179, 8, 0.2) 0%, rgba(161, 98, 7, 0.3) 100%)"
  },
  
  // Фиолетовые градиенты
  purple: {
    light: "linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(91, 33, 182, 0.1) 100%)",
    medium: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(91, 33, 182, 0.2) 100%)",
    strong: "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(91, 33, 182, 0.3) 100%)"
  },
  
  // Серые градиенты
  gray: {
    light: "linear-gradient(135deg, rgba(156, 163, 175, 0.05) 0%, rgba(107, 114, 128, 0.1) 100%)",
    medium: "linear-gradient(135deg, rgba(156, 163, 175, 0.1) 0%, rgba(107, 114, 128, 0.2) 100%)",
    strong: "linear-gradient(135deg, rgba(156, 163, 175, 0.2) 0%, rgba(107, 114, 128, 0.3) 100%)"
  }
};

// Более красочные градиенты для специальных элементов
export const specialGradients = {
  // Восход
  sunrise: "linear-gradient(135deg, rgba(251, 146, 60, 0.2) 0%, rgba(251, 113, 133, 0.2) 100%)",
  
  // Закат
  sunset: "linear-gradient(135deg, rgba(217, 70, 239, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)",
  
  // Море
  ocean: "linear-gradient(135deg, rgba(14, 165, 233, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)",
  
  // Лес
  forest: "linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%)",
  
  // Ночное небо
  nightSky: "linear-gradient(135deg, rgba(30, 58, 138, 0.2) 0%, rgba(55, 48, 163, 0.2) 100%)"
};

// Функция для получения градиента в зависимости от значения (положительное/отрицательное/нейтральное)
export const getGradientByValue = (value) => {
  if (value > 0) {
    return cardGradients.green.medium;
  } else if (value < 0) {
    return cardGradients.red.medium;
  } else {
    return cardGradients.gray.medium;
  }
};

// Функция для получения градиента по проценту выполнения
export const getGradientByPercentage = (percentage) => {
  if (percentage >= 80) {
    return cardGradients.green.medium;
  } else if (percentage >= 50) {
    return cardGradients.blue.medium;
  } else if (percentage >= 20) {
    return cardGradients.yellow.medium;
  } else {
    return cardGradients.red.medium;
  }
};

export default {
  cardGradients,
  specialGradients,
  getGradientByValue,
  getGradientByPercentage
}; 