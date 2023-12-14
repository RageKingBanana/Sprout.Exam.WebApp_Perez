namespace Sprout.Exam.WebApp.Models
{
    public class SalaryDetails
    {
        public const int decimalPlace = 2;
        public const int totalDays = 22; // this is number of total working days if there are no absences

        public const decimal perMonthRateRegular = 20000; //basic salary for regular employees
        public const decimal perMonthRateContract = 500; //daily rate of contractual employees

        public const decimal taxpercent = 0.12m;

    }
}
