package com.estora.controller;

import com.estora.dto.ApiResponse;
import com.estora.dto.PropertyDto;
import com.estora.dto.UserDto;
import com.estora.service.PropertyService;
import com.estora.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/agents")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AgentController {

    private final UserService userService;
    private final PropertyService propertyService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllAgents() {
        List<UserDto> agents = userService.getAgents();
        return ResponseEntity.ok(ApiResponse.success(agents));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> getAgentById(@PathVariable Long id) {
        UserDto agent = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(agent));
    }

    @GetMapping("/{id}/properties")
    public ResponseEntity<ApiResponse<List<PropertyDto>>> getAgentProperties(@PathVariable Long id) {
        List<PropertyDto> properties = propertyService.getPropertiesByAgent(id);
        return ResponseEntity.ok(ApiResponse.success(properties));
    }
}
