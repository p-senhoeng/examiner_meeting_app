import React from 'react';

const getGradeAndGPA = (score) => {
  if (score >= 95 && score <= 100) return { grade: 'A+', gpa: 9 };
  if (score >= 90 && score <= 94) return { grade: 'A+', gpa: 9 };
  if (score >= 85 && score <= 89) return { grade: 'A', gpa: 8 };
  if (score >= 80 && score <= 84) return { grade: 'A-', gpa: 7 };
  if (score >= 75 && score <= 79) return { grade: 'B+', gpa: 6 };
  if (score >= 70 && score <= 74) return { grade: 'B', gpa: 5 };
  if (score >= 65 && score <= 69) return { grade: 'B-', gpa: 4 };
  if (score >= 60 && score <= 64) return { grade: 'C+', gpa: 3 };
  if (score >= 55 && score <= 59) return { grade: 'C', gpa: 2 };
  if (score >= 50 && score <= 54) return { grade: 'C-', gpa: 1 };
  if (score >= 45 && score <= 49) return { grade: 'D', gpa: 0 };
  if (score >= 40 && score <= 44) return { grade: 'D', gpa: 0 };
  return { grade: 'E', gpa: 0 }; // 0-39
};

const GradeAndGPA = ({ score }) => {
  const { grade, gpa } = getGradeAndGPA(score);
  
  return (
    <span>
      {grade} (GPA: {gpa})
    </span>
  );
};

export default GradeAndGPA;
