using System;
using System.Reflection.Metadata;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sprout.Exam.Business.DataTransferObjects;
using Sprout.Exam.Common.Enums;
using Sprout.Exam.WebApp.Models;

namespace Sprout.Exam.WebApp.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeesController : ControllerBase
    {
        private readonly IEmployeeService _employeeService;

        public EmployeesController(IEmployeeService employeeService)
        {
            _employeeService = employeeService;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var result = await _employeeService.SelectAllEmployees();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _employeeService.GetEmployeeByIdAsync(id);
            if (result == null)
                return NotFound();

            var employeeDTO = new EmployeeDTO
            {
                Id = result.Id,
                FullName = result.FullName,
                Birthdate = result.Birthdate,
                TIN = result.TIN,
                EmployeeTypeId = result.EmployeeTypeId,
                IsDeleted = result.IsDeleted
            };

            return Ok(employeeDTO);
        }





        [HttpPut("{id}")]
        public async Task<IActionResult> Put(EditEmployeeDto input)
        {
            var result = await _employeeService.UpdateEmployeeAsync(input);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Post(CreateEmployeeDto input)
        {
            try
            {
                string resultMessage = await _employeeService.CreateEmployeeAsync(input);

                // Check the result message to determine success or failure
                if (resultMessage.StartsWith("Employee created successfully"))
                {
                    // Return a 201 Created status with a success message
                    return Created($"/api/employees/{input.Id}", resultMessage);
                }
                else
                {
                    // Return a 400 Bad Request status with the error message
                    return BadRequest(resultMessage);
                }
            }
            catch (Exception ex)
            {
                // Log the exception or handle it as needed
                Console.WriteLine($"An error occurred while processing the request: {ex.Message}");
                return StatusCode(500, "Internal Server Error");
            }
        }



        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _employeeService.DeleteEmployeeAsync(id);
            if (!result) return NotFound();
            return Ok(id);
        }

        [HttpPost("{id}/calculate")]
        public async Task<IActionResult> Calculate(CalculateDTO input)
        {
            var result = await _employeeService.GetEmployeeByIdAsync(input.Id);
            if (result == null) return NotFound();

            var type = (EmployeeType)result.EmployeeTypeId;

            decimal totalSalary = 0m;
            // Assign basic salary and tax rate based on employee type
            switch (type)
            {
                case EmployeeType.Regular:
                    var dailyRate = Math.Round(SalaryDetails.perMonthRateRegular / SalaryDetails.totalDays, SalaryDetails.decimalPlace);
                    var monthlyTaxTotal = Math.Round(SalaryDetails.perMonthRateRegular * SalaryDetails.taxpercent, SalaryDetails.decimalPlace);
                    var absentPenalty = Math.Round(dailyRate * input.AbsentDays, SalaryDetails.decimalPlace);
                    var totalDeducted = Math.Round(monthlyTaxTotal + absentPenalty, SalaryDetails.decimalPlace);
                    totalSalary = Math.Round(SalaryDetails.perMonthRateRegular - totalDeducted, SalaryDetails.decimalPlace);
                    break;
                case EmployeeType.Contractual:
                    totalSalary = Math.Round(SalaryDetails.perMonthRateContract * input.WorkedDays, SalaryDetails.decimalPlace);
                    break;
                default:
                    return NotFound("Employee Type not found");
            }



            return Ok(totalSalary);
        }


    }
}
