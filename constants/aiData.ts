export interface AIQuestion {
    id: string;
    subscriptionId: string;
    question: string;
    type: "usage" | "value" | "comparison";
}

export const aiQuestions: AIQuestion[] = [
    {
        id: "q1",
        subscriptionId: "spotify",
        question: "Bạn có thực sự nghe nhạc trên Spotify Premium thường xuyên không? Dịch vụ này sẽ tự động gia hạn ₫59.000 vào ngày 12/11. Bạn luôn có thể đăng ký lại khi cần nghe nhạc sau này.",
        type: "usage",
    },
    {
        id: "q2",
        subscriptionId: "netflix",
        question: "Đã bao lâu rồi bạn chưa sử dụng Netflix? Dịch vụ sẽ tiếp tục gia hạn với mức giá ₫260.000 vào ngày 05/11. Bạn luôn có thể đăng ký lại bất cứ lúc nào cần xem phim sau này.",
        type: "value",
    },
    {
        id: "q3",
        subscriptionId: "figma",
        question: "Figma Pro đang tốn của bạn ₫120.000/tháng. Bạn có đang sử dụng đầy đủ các tính năng chuyên nghiệp không? Nếu chỉ cần thiết kế cơ bản, bạn có thể chuyển sang gói miễn phí và tiết kiệm ₫1.440.000/năm.",
        type: "comparison",
    },
    {
        id: "q4",
        subscriptionId: "canva",
        question: "Canva Pro của bạn sẽ chuyển sang gói trả phí ₫96.000/tháng hôm nay (21/10). Bạn có thực sự cần các tính năng Pro không? Gói miễn phí vẫn rất mạnh mẽ cho hầu hết nhu cầu thiết kế.",
        type: "value",
    },
    {
        id: "q5",
        subscriptionId: "google-one",
        question: "Google One ₫25.000/tháng sắp hết hạn vào 25/10. Bạn có đang dùng hết dung lượng lưu trữ không? Nếu không, có thể tạm dừng và chỉ đăng ký lại khi thực sự cần thêm dung lượng.",
        type: "value",
    },
    {
        id: "q6",
        subscriptionId: "gym-fitness",
        question: "California Fitness đang tốn ₫1.200.000/tháng của bạn. Bạn có đang tập thường xuyên không? Phòng gym sẽ tự động gia hạn vào ngày 01/11. Nếu bạn ít đi tập, có thể tạm dừng và tiết kiệm chi phí.",
        type: "usage",
    },
    {
        id: "q7",
        subscriptionId: "english-class",
        question: "Lớp tiếng Anh ₫800.000/tháng sắp gia hạn vào 15/11. Bạn có tham gia đầy đủ các buổi học không? Nếu bận rộn, có thể tạm dừng và đăng ký lại khi có thời gian phù hợp hơn.",
        type: "value",
    },
    {
        id: "q8",
        subscriptionId: "bus-pass",
        question: "Vé xe buýt tháng ₫150.000 sắp gia hạn vào 01/11. Bạn có đang sử dụng xe buýt thường xuyên trong tháng này không? Nếu làm việc từ xa nhiều, có thể chuyển sang mua vé lẻ sẽ tiết kiệm hơn.",
        type: "usage",
    },
];
