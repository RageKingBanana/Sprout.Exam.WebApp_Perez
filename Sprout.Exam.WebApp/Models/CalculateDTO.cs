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
        [Required]
        public decimal ratePerDay { get; set; }
        [Required]
        public decimal salary { get; set; }
        [Required]
        public decimal tax { get; set; }
    }
}
