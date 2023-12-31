﻿using System;
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
            DateTime maxDate = DateTime.Now.AddYears(-60);
            DateTime minDate = DateTime.Now.AddYears(-18);

            // Assuming input.Birthdate is already a DateTime
            DateTime birthdate = input.Birthdate;

            // Check if the birthdate is within the allowed range
            if (birthdate >= maxDate && birthdate <= minDate)
            {
                try
                {
                    var result = await _employeeService.UpdateEmployeeAsync(input);

                    if (result == null)
                    {
                        // Employee with the given ID not found
                        return NotFound();
                    }

                    return Ok(result);
                }
                catch (Exception ex)
                {
                    // Log the exception or handle it as needed
                    Console.WriteLine($"An error occurred while processing the request: {ex.Message}");
                    return StatusCode(500, "Internal Server Error");
                }
            }
            else
            {
                // Return a 400 Bad Request status with an error message
                return BadRequest("Invalid birthdate. Only 18-60 years old are allowed to work");
            }
        }

        [HttpPost]
        public async Task<IActionResult> Post(CreateEmployeeDto input)
        {
            DateTime maxDate = DateTime.Now.AddYears(-60);
            DateTime minDate = DateTime.Now.AddYears(-18);

            // Assuming input.Birthdate is already a DateTime
            DateTime birthdate = input.Birthdate;

            // Check if the birthdate is within the allowed range
            if (birthdate >= maxDate && birthdate <= minDate)
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
            else
            {
                // Return a 400 Bad Request status with an error message
                return BadRequest("Invalid birthdate. Birthdate must be between 18 and 60 years ago.");
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
            try
            {
                var result = await _employeeService.GetEmployeeByIdAsync(input.Id);
                if (result == null) return NotFound();
                var taxPercent = input.tax / 100;
                var type = (EmployeeType)result.EmployeeTypeId;

                decimal totalSalary = 0m;
                // Assign basic salary and tax rate based on employee type
                switch (type)
                {
                    case EmployeeType.Regular:
                        var dailyRate = Math.Round(input.salary / SalaryDetails.totalDays, SalaryDetails.decimalPlace);
                        var monthlyTaxTotal = Math.Round(input.salary * taxPercent, SalaryDetails.decimalPlace);
                        var absentPenalty = Math.Round(dailyRate * input.AbsentDays, SalaryDetails.decimalPlace);
                        var totalDeducted = Math.Round(monthlyTaxTotal + absentPenalty, SalaryDetails.decimalPlace);
                        totalSalary = Math.Round(input.salary - totalDeducted, SalaryDetails.decimalPlace);
                        #region OldMethod for compute
                        //var dailyRate = Math.Round(SalaryDetails.perMonthRateRegular / SalaryDetails.totalDays, SalaryDetails.decimalPlace);
                        //var monthlyTaxTotal = Math.Round(SalaryDetails.perMonthRateRegular * SalaryDetails.taxpercent, SalaryDetails.decimalPlace);
                        //var absentPenalty = Math.Round(dailyRate * input.AbsentDays, SalaryDetails.decimalPlace);
                        //var totalDeducted = Math.Round(monthlyTaxTotal + absentPenalty, SalaryDetails.decimalPlace);
                        //totalSalary = Math.Round(SalaryDetails.perMonthRateRegular - totalDeducted, SalaryDetails.decimalPlace);
                        #endregion
                        break;
                    case EmployeeType.Contractual:
                        totalSalary = Math.Round(input.ratePerDay * input.WorkedDays, SalaryDetails.decimalPlace);
                        break;
                    default:
                        return NotFound("Employee Type not found");
                }
                totalSalary = Math.Max(totalSalary, 0);
                return Ok(totalSalary);
            }
            catch (Exception ex)
            {
                // Log the exception or handle it as needed
                return BadRequest($"Error calculating salary: {ex.Message}");
            }
        }



    }
}
