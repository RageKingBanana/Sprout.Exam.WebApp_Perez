using System.ComponentModel.DataAnnotations;

namespace Sprout.Exam.WebApp.Models
{
    public class CalculateDTO
    {
        public int Id { get; set; }
        [Required]
        public decimal AbsentDays { get; set; }
        [Required]
        public decimal WorkedDays { get; set; }
    }
}
