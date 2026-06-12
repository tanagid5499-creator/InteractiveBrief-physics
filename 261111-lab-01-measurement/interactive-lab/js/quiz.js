function setQuizFeedback(quiz, selectedButton) {
  const answer = quiz.dataset.answer;
  const selected = selectedButton.dataset.quizOption;
  const isCorrect = selected === answer;
  const feedback = quiz.querySelector("[data-quiz-feedback]");

  quiz.querySelectorAll("[data-quiz-option]").forEach((button) => {
    const buttonIsAnswer = button.dataset.quizOption === answer;
    button.classList.toggle("is-correct", buttonIsAnswer && isCorrect);
    button.classList.toggle("is-incorrect", button === selectedButton && !isCorrect);
    button.setAttribute("aria-pressed", String(button === selectedButton));
  });

  quiz.classList.toggle("is-answered", true);
  quiz.classList.toggle("is-correct", isCorrect);

  if (feedback) {
    feedback.textContent = isCorrect
      ? "ถูกต้อง ใช้หลักการอ่านสเกลและเลขนัยสำคัญได้เหมาะสม"
      : `ยังไม่ใช่ ลองเทียบกับหลักการอ่านค่าอีกครั้ง คำตอบที่ถูกคือ ${answer}`;
  }
}

export function initQuizzes() {
  document.querySelectorAll("[data-quiz-option]").forEach((button) => {
    button.addEventListener("click", () => {
      const quiz = button.closest(".quick-quiz");
      if (!quiz) return;
      setQuizFeedback(quiz, button);
    });
  });
}
