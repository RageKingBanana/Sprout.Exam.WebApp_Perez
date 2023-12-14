using Microsoft.Data.SqlClient;
using System.Data;
using System.Threading.Tasks;
using Sprout.Exam.Business.DataTransferObjects;
using Sprout.Exam.WebApp.Models;
using System;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;

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

            using (SqlConnection connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync(); // Use OpenAsync for asynchronous operation
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
                                Birthdate = Convert.ToDateTime(reader["Birthdate"]),
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
        public async Task<EmployeeDTO> GetEmployeeByIdAsync(int id)
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
                                Birthdate = Convert.ToDateTime(reader["Birthdate"]),
                                TIN = reader["TIN"].ToString(),
                                EmployeeTypeId = Convert.ToInt32(reader["EmployeeTypeId"]),
                                IsDeleted = Convert.ToBoolean(reader["IsDeleted"]),
                            };
                        }
                    }
                }
            }

            return null; // Employee not found
        }

        public async Task<EmployeeDTO> UpdateEmployeeAsync(EditEmployeeDto input)
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
                    command.Parameters.AddWithValue("@IsDeleted", false); // Assuming it's not deleted during an update

                    await command.ExecuteNonQueryAsync();
                }
            }

            // Fetch and return the updated employee
            return await GetEmployeeByIdAsync(input.Id);
        }


        public async Task<EmployeeDTO> CreateEmployeeAsync(CreateEmployeeDto input)
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

                    // Add an output parameter to capture the newly created employee's ID
                    SqlParameter outputParameter = new SqlParameter("@NewEmployeeId", SqlDbType.Int)
                    {
                        Direction = ParameterDirection.Output
                    };
                    command.Parameters.Add(outputParameter);

                    await command.ExecuteNonQueryAsync();

                    // Retrieve the value of the output parameter
                    int newEmployeeId = (int)outputParameter.Value;

                    // Fetch and return the newly created employee
                    return await GetEmployeeByIdAsync(newEmployeeId);
                }
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
