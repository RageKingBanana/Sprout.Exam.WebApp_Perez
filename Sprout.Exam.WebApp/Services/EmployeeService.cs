using Microsoft.Data.SqlClient;
using System.Data;
using System.Threading.Tasks;
using Sprout.Exam.Business.DataTransferObjects;
using Sprout.Exam.WebApp.Models;
using System;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;
using System.Globalization;

/* ************************** //
 USE OF ADO.NET IN ORDET TO CONNECT TO THE DATABASE DIRECTLY 
Stored Procedures created for the queries (can be seen in programmability folder of database)
*/
namespace Sprout.Exam.WebApp.Services
{
    public class EmployeeService : IEmployeeService
    {
        private readonly string _connectionString;

        public EmployeeService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }
        public async Task<IEnumerable<EmployeeDTO>> SelectAllEmployees()
        {
            List<EmployeeDTO> employees = new List<EmployeeDTO>();

            try
            {
                using (SqlConnection connection = new SqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    using (SqlCommand command = new SqlCommand("SelectAllEmployees", connection))
                    {
                        using (SqlDataReader reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                employees.Add(new EmployeeDTO
                                {
                                    Id = Convert.ToInt32(reader["Id"]),
                                    FullName = reader["FullName"].ToString(),
                                    Birthdate = ((DateTime)reader["Birthdate"]).Date,
                                    TIN = reader["TIN"].ToString(),
                                    EmployeeTypeId = Convert.ToInt32(reader["EmployeeTypeId"]),
                                    IsDeleted = Convert.ToBoolean(reader["IsDeleted"]),
                                });
                            }
                        }
                    }
                }
                return employees;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred while selecting all employees: {ex.Message}");
                throw new Exception("Error retrieving employees", ex);
            }

        }

        public async Task<EmployeeDTO> GetEmployeeByIdAsync(int id)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    using (SqlCommand command = new SqlCommand("GetEmployeeById", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@EmployeeId", id);

                        using (SqlDataReader reader = await command.ExecuteReaderAsync())
                        {
                            if (await reader.ReadAsync())
                            {
                                return new EmployeeDTO
                                {
                                    Id = Convert.ToInt32(reader["Id"]),
                                    FullName = reader["FullName"].ToString(),
                                    Birthdate = Convert.ToDateTime(reader["Birthdate"]).Date,
                                    TIN = reader["TIN"].ToString(),
                                    EmployeeTypeId = Convert.ToInt32(reader["EmployeeTypeId"]),
                                    IsDeleted = Convert.ToBoolean(reader["IsDeleted"]),
                                };
                            }
                            else
                            {
                                // Employee not found
                                return null;
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred while getting an employee by ID: {ex.Message}");
                throw new Exception("Error retrieving employees", ex);
            }
        }


        public async Task<EmployeeDTO> UpdateEmployeeAsync(EditEmployeeDto input)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    using (SqlCommand command = new SqlCommand("UpdateEmployee", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@EmployeeId", input.Id);
                        command.Parameters.AddWithValue("@FullName", input.FullName);
                        command.Parameters.AddWithValue("@Birthdate", input.Birthdate);
                        command.Parameters.AddWithValue("@TIN", input.Tin);
                        command.Parameters.AddWithValue("@EmployeeTypeId", input.TypeId);


                        await command.ExecuteNonQueryAsync();
                    }
                }

                // Fetch and return the updated employee
                return await GetEmployeeByIdAsync(input.Id);
            }
            catch (Exception ex)
            {
                // Log or handle the exception as needed
                // You can also rethrow the exception if you want it to be caught by a higher-level handler
                throw new Exception("Error updating employee", ex);
            }
        }



        public async Task<string> CreateEmployeeAsync(CreateEmployeeDto input)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    using (SqlCommand command = new SqlCommand("CreateEmployee", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@FullName", input.FullName);
                        command.Parameters.AddWithValue("@Birthdate", input.Birthdate);
                        command.Parameters.AddWithValue("@TIN", input.Tin);
                        command.Parameters.AddWithValue("@EmployeeTypeId", input.TypeId);
                        command.Parameters.AddWithValue("@IsDeleted", false); // new create so it must be false

                        // Execute the stored procedure
                        await command.ExecuteNonQueryAsync();

                        // Return a success message
                        return "Employee created successfully!";
                    }
                }
            }
            catch (Exception ex)
            {
                // Log the exception or handle it as needed
                Console.WriteLine($"An error occurred while creating an employee: {ex.Message}");
                return $"Error creating employee: {ex.Message}";
            }
        }





        public async Task<bool> DeleteEmployeeAsync(int id)
        {
            using (SqlConnection connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                using (SqlCommand command = new SqlCommand("DeleteEmployee", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@EmployeeId", id);

                    int rowsAffected = await command.ExecuteNonQueryAsync();
                    return rowsAffected > 0; // Returns true if any rows were affected (employee deleted)
                }
            }
        }
    }
}
